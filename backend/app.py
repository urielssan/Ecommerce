import os
from flask import Flask, jsonify, request, make_response
import json
import uuid
from flask_cors import CORS, cross_origin
from flask_mail import Mail, Message
import mysql.connector
from dotenv import load_dotenv
import mercadopago
import requests
import datetime

# 1. Cargar variables de entorno del archivo .env
load_dotenv()

app = Flask(__name__)

# 2. Configurar CORS usando la variable de entorno
frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
CORS(app, resources={r"/api/*": {"origins": frontend_url}}, supports_credentials=True)

# 3. Configuración de Base de Datos segura
db_config = {
    'host': os.getenv('DB_HOST'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME')
}

# 4. Configuración de Correo segura
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 465))
app.config['MAIL_USE_SSL'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

mail = Mail(app)

# 5. Configuración de API de Google (Place ID y API Key)
# REEMPLAZAR CON SUS CREDENCIALES
GOOGLE_PLACES_API_KEY = os.getenv('AIzaSyCti9txdlYUFBavzbiHLhZ9-1B5XqwjaQU', 'AIzaSyCti9txdlYUFBavzbiHLhZ9-1B5XqwjaQU')
GOOGLE_PLACE_ID = os.getenv('ChIJFztmHwKrt5URCV8N3je6JEk', 'ChIJFztmHwKrt5URCV8N3je6JEk')

# --- CONFIGURACIÓN BD EXTENDIDA ---
def ensure_tables():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        # Tabla PEDIDOS
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS pedidos (
                id_pedido INT AUTO_INCREMENT PRIMARY KEY,
                ID VARCHAR(255),
                DNI VARCHAR(50),
                Vendedor VARCHAR(100),
                Cliente VARCHAR(100),
                Direccion TEXT,
                Telefono VARCHAR(50),
                Email VARCHAR(100),
                FechaNacimiento DATE,
                Sexo VARCHAR(20),
                FechaEntrega DATE,
                HorarioEntrega VARCHAR(50),
                MetodoPago VARCHAR(50),
                Monto DECIMAL(10,2),
                Pagado VARCHAR(20),
                Producto VARCHAR(255),
                Cantidad INT,
                TipoPedido VARCHAR(50),
                EnvioDomicilio VARCHAR(10),
                CostoEnvio DECIMAL(10,2),
                Observaciones TEXT,
                Descuento DECIMAL(10,2),
                FechaIngreso DATE,
                Banco VARCHAR(100),
                Local VARCHAR(100),
                Medio VARCHAR(100)
            )
        """)

        # Migracion: Agregar columna imagen_url a categorias
        try:
            cursor.execute("ALTER TABLE categorias ADD COLUMN imagen_url TEXT")
        except Exception as e:
            pass # Asumimos que ya existe

        # Migracion: Agregar columna imagen_url a subcategorias
        try:
            cursor.execute("ALTER TABLE subcategorias ADD COLUMN imagen_url TEXT")
        except Exception as e:
            pass # Asumimos que ya existe

        # Tabla para Cache de Reviews de Google
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS google_reviews_cache (
                id INT AUTO_INCREMENT PRIMARY KEY,
                reviews_json TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        """)

        # Tabla Miembros de la Familia (Clientes Fieles)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS miembros_familia (
                dni VARCHAR(20) PRIMARY KEY,
                nombre VARCHAR(100),
                apellido VARCHAR(100),
                direccion TEXT,
                telefono VARCHAR(50),
                email VARCHAR(100),
                fecha_nacimiento DATE,
                sexo VARCHAR(20),
                fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Tabla Movimientos de Stock
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS movimientos_stock (
                id INT AUTO_INCREMENT PRIMARY KEY,
                id_producto INT,
                fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                tipo VARCHAR(20), -- 'entrada', 'salida'
                cantidad INT,
                motivo VARCHAR(255),
                usuario VARCHAR(100),
                FOREIGN KEY (id_producto) REFERENCES productos(idProductos) ON DELETE CASCADE
            )
        """)
        
        # Migracion: Agregar columna usuario a movimientos_stock
        try:
            cursor.execute("ALTER TABLE movimientos_stock ADD COLUMN usuario VARCHAR(100)")
        except Exception as e:
            pass # Ya existe
            
        # Migracion: Permitir sobreescribir fecha si se desea (aunque es TIMESTAMP, se puede insertar)

        # Migracion: Agregar columnas a productos
        new_columns = [
            ("IngredientesSugeridos", "TEXT"),
            ("InstruccionesMantenimiento", "TEXT"),
            ("SugerenciasCoccion", "TEXT"),
            ("EsUltracongelado", "BOOLEAN DEFAULT 0"),
            ("TieneSugerenciasCoccion", "BOOLEAN DEFAULT 0"),
            ("Porcion", "VARCHAR(255)"),
            ("NombreSimple", "VARCHAR(255)"),
            ("barcode", "VARCHAR(255)"),
            ("slug", "VARCHAR(255)")
        ]

        for col_name, col_type in new_columns:
            try:
                cursor.execute(f"ALTER TABLE productos ADD COLUMN {col_name} {col_type}")
            except Exception as e:
                pass # Asumimos que ya existe

        conn.commit()
        cursor.close()
        conn.close()
        print("Tablas verificadas/creadas")
    except Exception as e:
        print(f"Error verificando tablas: {e}")

# Ejecutar chequeo al inicio
ensure_tables()

# --- RUTAS ---

@app.route('/')
def home():
    return "API Garcia Vidal funcionando en modo: " + os.getenv('FLASK_ENV', 'production')

@app.route('/api/productos', methods=['GET'])
def obtener_productos():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        
        query = """
            SELECT 
                p.idProductos, p.NombresProductos, p.NombreSimple, p.Precio,
                p.descripcion, p.descripcionProducto, p.marca,
                p.IngredientesSugeridos, p.InstruccionesMantenimiento, p.SugerenciasCoccion,
                p.EsUltracongelado, p.TieneSugerenciasCoccion, p.Porcion,
                p.barcode, p.slug, p.UrlImagen,
                p.valor_propiedad_1, p.nombre_propiedad_1, p.tags, p.seo_descripcion,
                s.nombre AS nombre_subcategoria,
                c.nombre AS nombre_categoria
            FROM productos p
            LEFT JOIN subcategorias s ON p.idSubcategoria = s.idSubcategoria
            LEFT JOIN categorias c ON s.idCategoria = c.idCategoria
        """
        cursor.execute(query)
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(data)
    except Exception as e:
        print(f"Error interno: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/productos/<int:id>', methods=['GET'])
def obtener_producto_detalle(id):
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT p.*, s.nombre AS nombre_subcategoria, c.nombre AS nombre_categoria, c.idCategoria
            FROM productos p
            LEFT JOIN subcategorias s ON p.idSubcategoria = s.idSubcategoria
            LEFT JOIN categorias c ON s.idCategoria = c.idCategoria
            WHERE p.idProductos = %s
        """
        cursor.execute(query, (id,))
        data = cursor.fetchone()
        cursor.close()
        conn.close()
        if data:
            return jsonify(data)
        else:
            return jsonify({"message": "Producto no encontrado"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- ROUTES RESTORED ---



@app.route('/api/menu', methods=['GET'])
def obtener_menu_completo():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT 
                c.idCategoria, c.nombre AS nombre_categoria, c.imagen_url as cat_img,
                s.idSubcategoria, s.nombre AS nombre_subcategoria, s.imagen_url as sub_img
            FROM categorias c
            LEFT JOIN subcategorias s ON c.idCategoria = s.idCategoria
            ORDER BY c.nombre, s.nombre
        """
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        
        menu_structure = {}
        for row in rows:
            cat_id = row['idCategoria']
            if cat_id not in menu_structure:
                menu_structure[cat_id] = {
                    'idCategoria': cat_id,
                    'nombre': row['nombre_categoria'],
                    'imagen_url': row['cat_img'],
                    'subcategorias': []
                }
            if row['idSubcategoria']:
                menu_structure[cat_id]['subcategorias'].append({
                    'idSubcategoria': row['idSubcategoria'],
                    'nombre': row['nombre_subcategoria'],
                    'imagen_url': row['sub_img']
                })
        return jsonify(list(menu_structure.values()))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/categorias', methods=['GET'])
def obtener_categorias():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM categorias")
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/subcategorias', methods=['GET'])
def obtener_subcategorias():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT s.idSubcategoria, s.nombre, s.imagen_url, s.idCategoria, c.nombre as nombre_categoria 
            FROM subcategorias s
            LEFT JOIN categorias c ON s.idCategoria = c.idCategoria
        """
        cursor.execute(query)
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/search-index', methods=['GET'])
@cross_origin()
def get_search_index():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT 
                p.idProductos, 
                p.NombresProductos AS nombre, 
                c.nombre AS categoria
            FROM productos p
            LEFT JOIN subcategorias s ON p.idSubcategoria = s.idSubcategoria
            LEFT JOIN categorias c ON s.idCategoria = c.idCategoria
        """
        cursor.execute(query)
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/contacto', methods=['POST'])
def enviar_contacto():
    try:
        data = request.json
        nombre = data.get('nombre')
        email = data.get('email')
        telefono = data.get('telefono')
        mensaje = data.get('mensaje')

        cuerpo_mensaje = f"""
        NUEVO MENSAJE DESDE LA WEB
        --------------------------------
        De: {nombre}
        Email: {email}
        Teléfono: {telefono}
        Mensaje: {mensaje}
        """

        # Mock send if variables not set
        if not app.config['MAIL_USERNAME']:
             print("Mail not configured, mocking send:", cuerpo_mensaje)
             return jsonify({"message": "Correo enviado con éxito (mock)"}), 200

        msg = Message(
            subject=f"Nuevo Contacto Web: {nombre}",
            recipients=[os.getenv('MAIL_RECIPIENT')],
            body=cuerpo_mensaje
        )
        mail.send(msg)
        return jsonify({"message": "Correo enviado con éxito"}), 200
    except Exception as e:
        print(f"Error enviando mail: {e}")
        return jsonify({"error": "No se pudo enviar el correo"}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')

        users_file = os.path.join(os.path.dirname(__file__), 'users.json')
        if not os.path.exists(users_file):
             # Create default user if missing
             with open(users_file, 'w') as f:
                 json.dump([{"username": "admin", "password": "123"}], f)
        
        with open(users_file, 'r', encoding='utf-8') as f:
            users = json.load(f)

        user = next((u for u in users if u['username'] == username and u['password'] == password), None)

        if user:
            token = str(uuid.uuid4())
            return jsonify({"message": "Login exitoso", "token": token, "username": username}), 200
        else:
            return jsonify({"message": "Credenciales inválidas"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/productos', methods=['POST'])
def crear_producto():
    try:
        data = request.json
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        # Generar Slug y Barcode si no vienen (simple logic)
        slug = data.get('slug')
        if not slug and data.get('NombresProductos'):
            slug = data.get('NombresProductos').lower().replace(' ', '-')
        
        barcode = data.get('barcode') or str(uuid.uuid4())[:12] # Mock generation

        query = """
            INSERT INTO productos (
                NombresProductos, NombreSimple, Precio, descripcion, descripcionProducto, marca, 
                valor_propiedad_1, nombre_propiedad_1, tags, seo_descripcion, idSubcategoria,
                IngredientesSugeridos, InstruccionesMantenimiento, SugerenciasCoccion,
                EsUltracongelado, TieneSugerenciasCoccion, Porcion, barcode, slug, UrlImagen
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            data.get('NombresProductos'), data.get('NombreSimple'), data.get('Precio'), data.get('descripcion'), 
            data.get('descripcionProducto'), data.get('marca'), data.get('valor_propiedad_1'), 
            data.get('nombre_propiedad_1'), data.get('tags'), data.get('seo_descripcion'), 
            data.get('idSubcategoria'),
            data.get('IngredientesSugeridos'), data.get('InstruccionesMantenimiento'), data.get('SugerenciasCoccion'),
            data.get('EsUltracongelado'), data.get('TieneSugerenciasCoccion'), data.get('Porcion'),
            barcode, slug, data.get('UrlImagen')
        )
        
        cursor.execute(query, values)
        conn.commit()
        new_id = cursor.lastrowid
        cursor.close()
        conn.close()
        return jsonify({"message": "Producto creado", "id": new_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/productos/<int:id>', methods=['PUT'])
def actualizar_producto(id):
    try:
        data = request.json
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        query = """
            UPDATE productos SET
                NombresProductos=%s, NombreSimple=%s, Precio=%s, descripcion=%s, descripcionProducto=%s, marca=%s, 
                valor_propiedad_1=%s, nombre_propiedad_1=%s, tags=%s, seo_descripcion=%s, idSubcategoria=%s,
                IngredientesSugeridos=%s, InstruccionesMantenimiento=%s, SugerenciasCoccion=%s,
                EsUltracongelado=%s, TieneSugerenciasCoccion=%s, Porcion=%s, barcode=%s, slug=%s, UrlImagen=%s
            WHERE idProductos=%s
        """
        values = (
            data.get('NombresProductos'), data.get('NombreSimple'), data.get('Precio'), data.get('descripcion'), 
            data.get('descripcionProducto'), data.get('marca'), data.get('valor_propiedad_1'), 
            data.get('nombre_propiedad_1'), data.get('tags'), data.get('seo_descripcion'), 
            data.get('idSubcategoria'),
            data.get('IngredientesSugeridos'), data.get('InstruccionesMantenimiento'), data.get('SugerenciasCoccion'),
            data.get('EsUltracongelado'), data.get('TieneSugerenciasCoccion'), data.get('Porcion'),
            data.get('barcode'), data.get('slug'), data.get('UrlImagen'),
            id
        )
        
        cursor.execute(query, values)
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Producto actualizado"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/productos/<int:id>', methods=['DELETE'])
def eliminar_producto(id):
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM productos WHERE idProductos = %s", (id,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Producto eliminado"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- PEDIDOS Y STOCK ---

@app.route('/api/orders', methods=['POST'])
def crear_pedido_usuario():
    try:
        data = request.json
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        # Insertar pedido (Cabecera simplificada o multiples filas, segun tu esquema original "pedidos" parece desnormalizada por item?)
        # Mirando 'obtener_pedidos_admin', la tabla 'pedidos' guarda UNA FILA POR ITEM de producto.
        # "ID VARCHAR(255)" se usa para agrupar el pedido.
        
        order_id = str(uuid.uuid4())
        cart_items = data.get('cartItems', [])
        
        # Datos comunes
        cliente = data.get('nombre')
        dni = data.get('dni')
        direccion = data.get('direccion')
        telefono = data.get('telefono')
        email = data.get('email')
        metodo_pago = data.get('metodoPago')
        monto_total = data.get('montoTotal')
        tipo_pedido = data.get('tipoPedido')
        fecha_entrega = data.get('fechaEntrega')
        horario_entrega = data.get('horarioEntrega')
        envio_domicilio = data.get('envioDomicilio')
        observaciones = data.get('observaciones')
        fecha_ingreso = data.get('fechaIngreso') # o NOW()
        medio = data.get('medio') # 'Web', 'Local', etc.

        for item in cart_items:
            # Insertar en pedidos
            query_pedido = """
                INSERT INTO pedidos (
                    ID, DNI, Cliente, Direccion, Telefono, Email, 
                    MetodoPago, Monto, Pagado, Producto, Cantidad, 
                    TipoPedido, EnvioDomicilio, Observaciones, FechaIngreso,
                    FechaEntrega, HorarioEntrega, Medio
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), %s, %s, %s)
            """
            # Asumimos Pagado='No' por defecto, o data.get('pagado')?
            # En OrderTaker suele ser inmediato.
            # Stock Logic: 'salida' al confirmar
            
            cursor.execute(query_pedido, (
                order_id, dni, cliente, direccion, telefono, email,
                metodo_pago, monto_total, 'No', item['NombresProductos'], item['quantity'],
                tipo_pedido, envio_domicilio, observaciones, fecha_entrega, horario_entrega, medio
            ))

            # Movimiento de Stock (SALIDA)
            query_stock = """
                INSERT INTO movimientos_stock (id_producto, tipo, cantidad, motivo)
                VALUES (%s, 'salida', %s, %s)
            """
            cursor.execute(query_stock, (item['idProductos'], item['quantity'], f"Venta Pedido {order_id[:8]}"))

        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"message": "Pedido creado con éxito", "orderId": order_id}), 201

    except Exception as e:
        print("Error creating order:", e)
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/stock/movimiento', methods=['POST'])
def agregar_movimiento_stock():
    try:
        data = request.json
        id_producto = data.get('id_producto')
        tipo = data.get('tipo') # 'entrada' o 'salida'
        cantidad = int(data.get('cantidad'))
        motivo = data.get('motivo', 'Manual')
        usuario = data.get('usuario', 'Admin')
        fecha = data.get('fecha') # Optional custom date

        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        if fecha:
             cursor.execute("INSERT INTO movimientos_stock (id_producto, tipo, cantidad, motivo, usuario, fecha) VALUES (%s, %s, %s, %s, %s, %s)", 
                       (id_producto, tipo, cantidad, motivo, usuario, fecha))
        else:
             cursor.execute("INSERT INTO movimientos_stock (id_producto, tipo, cantidad, motivo, usuario) VALUES (%s, %s, %s, %s, %s)", 
                       (id_producto, tipo, cantidad, motivo, usuario))
        
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Movimiento registrado"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/stock/report', methods=['GET'])
def reporte_stock():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)

        # Para simplificar, calculamos el stock actual sumando entradas - salidas
        # Y para el reporte detallado, necesitamos agrupar.
        # User wants columns: Fecha | Producto | Stock inicial | Entradas | Salidas | Stock Final ...
        
        # Vamos a generar un reporte del DIA ACTUAL por defecto si no se pasa fecha.
        # O un listado de TODOS los productos con su estado HOY.
        
        query_productos = "SELECT idProductos, NombresProductos FROM productos"
        cursor.execute(query_productos)
        productos = cursor.fetchall()
        
        report = []
        
        # Simulación de cálculo. Para producción real, esto debe optimizarse con SQL views o subqueries.
        hoy = datetime.date.today()
        
        for p in productos:
            pid = p['idProductos']
            pname = p['NombresProductos']
            
            # Stock Total Histórico (Stock Actual Real)
            cursor.execute("SELECT tipo, SUM(cantidad) as total FROM movimientos_stock WHERE id_producto = %s GROUP BY tipo", (pid,))
            movs = cursor.fetchall()
            entradas_totales = sum([m['total'] for m in movs if m['tipo'] == 'entrada'])
            salidas_totales = sum([m['total'] for m in movs if m['tipo'] == 'salida'])
            stock_actual = entradas_totales - salidas_totales
            
            # Movimientos de HOY
            cursor.execute("""
                SELECT tipo, SUM(cantidad) as total 
                FROM movimientos_stock 
                WHERE id_producto = %s AND DATE(fecha) = %s 
                GROUP BY tipo
            """, (pid, hoy))
            movs_hoy = cursor.fetchall()
            entradas_hoy = sum([m['total'] for m in movs_hoy if m['tipo'] == 'entrada'])
            salidas_hoy = sum([m['total'] for m in movs_hoy if m['tipo'] == 'salida'])
            
            # Stock Inicial del Día = Stock Actual - (Entradas Hoy - Salidas Hoy)
            # No, Stock Final = Stock Inicial + Entradas - Salidas
            # => Stock Inicial = Stock Final - Entradas + Salidas
            stock_inicial_dia = stock_actual - entradas_hoy + salidas_hoy
            
            # Salidas Futuras (Pedidos con FechaEntrega > Hoy)
            # Nota, tabla pedidos guarda CADA item.
            cursor.execute("""
                SELECT SUM(Cantidad) as total
                FROM pedidos
                WHERE Producto = %s AND FechaEntrega > %s
            """, (pname, hoy))
            # Ojo: pedidos usa 'Producto' (nombre) no ID en tu esquema original? 
            # El esquema dice `Producto VARCHAR(255)`. Espero que coincida con NombresProductos.
            # Validemos eso.
            
            res_futuro = cursor.fetchone()
            salidas_futuras = res_futuro['total'] if res_futuro and res_futuro['total'] else 0
            
            stock_disponible = stock_actual - salidas_futuras
            
            # Stock Minimo (Dynamic based on last 30 days sales)
            thirty_days_ago = hoy - datetime.timedelta(days=30)
            cursor.execute("""
                SELECT SUM(cantidad) as total_salidas
                FROM movimientos_stock
                WHERE id_producto = %s AND tipo = 'salida' AND fecha >= %s
            """, (pid, thirty_days_ago))
            res_30 = cursor.fetchone()
            salidas_30_dias = res_30['total_salidas'] if res_30 and res_30['total_salidas'] else 0
            
            # Promedio diario
            consumo_diario = salidas_30_dias / 30
            # Stock de seguridad para 7 dias
            stock_minimo = int(consumo_diario * 7)
            if stock_minimo < 10:
                stock_minimo = 10 # Floor minimo

            # Semanas de stock
            # Si consumo diario es 0, y tenemos stock, son "infinitas" semanas. 
            # Si stock es 0, 0 semanas.
            if consumo_diario > 0:
                semanas_stock = round(stock_actual / (consumo_diario * 7), 1)
            else:
                semanas_stock = 99 if stock_actual > 0 else 0
            
            report.append({
                "fecha": hoy.strftime("%Y-%m-%d"),
                "producto": pname,
                "stock_inicial": stock_inicial_dia,
                "entradas_dia": entradas_hoy,
                "salidas_dia": salidas_hoy,
                "stock_final": stock_actual,
                "salidas_futuras": salidas_futuras,
                "stock_disponible": stock_disponible,
                "stock_minimo": stock_minimo,
                "semanas_stock": semanas_stock
            })

        cursor.close()
        conn.close()
        return jsonify(report)

    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500



# --- CRUD PEDIDOS (ADMIN) ---

@app.route('/api/admin/orders', methods=['GET'])
def obtener_pedidos_admin():
    try:
        # Filtros
        fecha_inicio = request.args.get('fecha_inicio')
        fecha_fin = request.args.get('fecha_fin')
        cliente = request.args.get('cliente')
        metodo_pago = request.args.get('metodo_pago')
        estado = request.args.get('estado') # 'Si' (Pagado) o 'No' (Pendiente)

        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)

        query = "SELECT * FROM pedidos WHERE 1=1"
        params = []

        if fecha_inicio and fecha_fin:
            query += " AND DATE(FechaIngreso) BETWEEN %s AND %s"
            params.append(fecha_inicio)
            params.append(fecha_fin)
        elif fecha_inicio:
            query += " AND DATE(FechaIngreso) >= %s"
            params.append(fecha_inicio)
        elif fecha_fin:
            query += " AND DATE(FechaIngreso) <= %s"
            params.append(fecha_fin)
        
        if cliente:
            query += " AND (Cliente LIKE %s OR DNI LIKE %s)"
            search_term = f"%{cliente}%"
            params.append(search_term)
            params.append(search_term)
        
        if metodo_pago and metodo_pago != 'Todos':
            query += " AND MetodoPago = %s"
            params.append(metodo_pago)
        
        if estado and estado != 'Todos':
            query += " AND Pagado = %s"
            params.append(estado)

        query += " ORDER BY FechaIngreso DESC, id_pedido DESC"

        cursor.execute(query, tuple(params))
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        # Agrupar por ID de pedido
        orders = {}
        for row in rows:
            order_id = row['ID']
            if order_id not in orders:
                orders[order_id] = {
                    'ID': order_id,
                    'Cliente': row['Cliente'],
                    'DNI': row['DNI'],
                    'Items': [],
                    'Total': row['Monto'],
                    'Fecha': row['FechaIngreso'], 
                    'Pagado': row['Pagado'],
                    'MetodoPago': row['MetodoPago'],
                    'Envio': row['EnvioDomicilio'],
                    'TipoPedido': row['TipoPedido'], 
                    'EstadoEnvio': 'Pendiente', 
                    'Direccion': row['Direccion'],
                    'Telefono': row['Telefono'],
                    'Email': row['Email'],
                    'FechaEntrega': row['FechaEntrega'],
                    'HorarioEntrega': row['HorarioEntrega'],
                    'Contacto': row['Telefono'] or row['Email'],
                    'Observaciones': row['Observaciones']
                }
            
            orders[order_id]['Items'].append({
                'Producto': row['Producto'],
                'Cantidad': row['Cantidad']
            })

        return jsonify(list(orders.values()))
    except Exception as e:
        print("Error fetching orders:", e)
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/orders/<string:order_id>/pay', methods=['PUT'])
def toggle_pago_pedido(order_id):
    try:
        data = request.json
        nuevo_estado = data.get('pagado') # 'Si' o 'No'
        
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("UPDATE pedidos SET Pagado = %s WHERE ID = %s", (nuevo_estado, order_id))
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"message": f"Pedido marcado como {'Pagado' if nuevo_estado == 'Si' else 'No Pagado'}"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- CRUD CATEGORIAS ---

@app.route('/api/admin/categorias', methods=['POST'])
def crear_categoria():
    try:
        data = request.json
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO categorias (nombre, imagen_url) VALUES (%s, %s)", (data.get('nombre'), data.get('imagen_url')))
        conn.commit()
        new_id = cursor.lastrowid
        cursor.close()
        conn.close()
        return jsonify({"message": "Categoría creada", "id": new_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/categorias/<int:id>', methods=['PUT'])
def actualizar_categoria(id):
    try:
        data = request.json
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("UPDATE categorias SET nombre=%s, imagen_url=%s WHERE idCategoria=%s", (data.get('nombre'), data.get('imagen_url'), id))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Categoría actualizada"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/categorias/<int:id>', methods=['DELETE'])
def eliminar_categoria(id):
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        # Eliminar productos asociados a subcategorías de esta categoría
        cursor.execute("""
            DELETE p FROM productos p
            JOIN subcategorias s ON p.idSubcategoria = s.idSubcategoria
            WHERE s.idCategoria = %s
        """, (id,))
        
        # Eliminar subcategorías de esta categoría
        cursor.execute("DELETE FROM subcategorias WHERE idCategoria = %s", (id,))
        
        # Finalmente eliminar la categoría
        cursor.execute("DELETE FROM categorias WHERE idCategoria = %s", (id,))
        
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Categoría y sus dependencias eliminadas"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- CRUD SUBCATEGORIAS ---

@app.route('/api/admin/subcategorias', methods=['POST'])
def crear_subcategoria():
    try:
        data = request.json
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO subcategorias (nombre, idCategoria, imagen_url) VALUES (%s, %s, %s)", 
                       (data.get('nombre'), data.get('idCategoria'), data.get('imagen_url')))
        conn.commit()
        new_id = cursor.lastrowid
        cursor.close()
        conn.close()
        return jsonify({"message": "Subcategoría creada", "id": new_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/subcategorias/<int:id>', methods=['PUT'])
def actualizar_subcategoria(id):
    try:
        data = request.json
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("UPDATE subcategorias SET nombre=%s, idCategoria=%s, imagen_url=%s WHERE idSubcategoria=%s", 
                       (data.get('nombre'), data.get('idCategoria'), data.get('imagen_url'), id))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Subcategoría actualizada"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/subcategorias/<int:id>', methods=['DELETE'])
def eliminar_subcategoria(id):
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        # Eliminar productos de esta subcategoría
        cursor.execute("DELETE FROM productos WHERE idSubcategoria = %s", (id,))
        
        # Eliminar la subcategoría
        cursor.execute("DELETE FROM subcategorias WHERE idSubcategoria = %s", (id,))
        
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Subcategoría eliminada"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/create_preference', methods=['POST'])
def create_preference():
    try:
        # SDK Configuration
        # Usamos un token de prueba si no hay uno en .env
        access_token = os.getenv('MP_ACCESS_TOKEN', 'TEST-7434557990176378-090912-70697b0956b637500350d876307fa3bd-244346845') 
        sdk = mercadopago.SDK(access_token)
        
        data = request.json
        items = data.get('items', [])
        
        preference_items = []
        for item in items:
            preference_items.append({
                "title": item.get('NombresProductos') or "Producto",
                "quantity": int(item.get('quantity', 1)),
                "currency_id": "ARS",
                "unit_price": float(item.get('Precio', 0))
            })
            
        frontend = os.getenv('FRONTEND_URL', 'http://127.0.0.1:3000').rstrip('/')

        preference_data = {
            "items": preference_items,
            "back_urls": {
                "success": f"{frontend}/", # Home
                "failure": f"{frontend}/checkout",
                "pending": f"{frontend}/checkout"
            },
            # "auto_return": "approved", # Desactivado temporalmente para localhost
            "external_reference": str(uuid.uuid4()) # Útil para rastrear
        }
        
        print("Enviando preferencia a Mercado Pago:", preference_data)
        
        preference_response = sdk.preference().create(preference_data)
        preference = preference_response["response"]
        
        print("Respuesta de Mercado Pago:", preference)

        if "init_point" in preference:
            return jsonify({"init_point": preference["init_point"]}), 200
        else:
            # Si no hay init_point, mostramos el error de MP
            error_msg = preference.get('message', 'Error desconocido de Mercado Pago')
            return jsonify({"error": error_msg, "details": preference}), 400

    except Exception as e:
        print(f"Error creating preference: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/reviews', methods=['GET'])
def obtener_reviews():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        
        # 1. Verificar cache
        cursor.execute("SELECT * FROM google_reviews_cache LIMIT 1")
        row = cursor.fetchone()
        
        should_refresh = True
        cached_data = None
        
        if row:
            import datetime
            updated_at = row['updated_at']
            # Asegurar compatibilidad de tipos si mysql devuelve datetime
            if isinstance(updated_at, str):
                 last_update = datetime.datetime.strptime(updated_at, '%Y-%m-%d %H:%M:%S')
            else:
                 last_update = updated_at
            
            # Check si pasaron menos de 3 días
            age = datetime.datetime.now() - last_update
            if age.days < 3:
                should_refresh = False
                cached_data = json.loads(row['reviews_json'])
        
        if not should_refresh and cached_data:
            cursor.close()
            conn.close()
            return jsonify(cached_data)

        # 2. Fetch de Google API (si el cache expiró o no existe)
        if not GOOGLE_PLACES_API_KEY or not GOOGLE_PLACE_ID or 'SU_API_KEY' in GOOGLE_PLACES_API_KEY:
            # Si no hay credenciales, devolvemos error o array vacio
            print("Faltan credenciales de Google API")
            cursor.close()
            conn.close()
            if cached_data: return jsonify(cached_data)
            return jsonify([])

        google_url = f"https://maps.googleapis.com/maps/api/place/details/json?place_id={GOOGLE_PLACE_ID}&fields=reviews&key={GOOGLE_PLACES_API_KEY}&language=es"
        
        print(f"Fetching Google Reviews URL: {google_url}")
        resp = requests.get(google_url)
        data = resp.json()
        print(f"Google API Response Status: {resp.status_code}")
        print(f"Google API Response Body: {data}")
        
        reviews = []
        if 'result' in data and 'reviews' in data['result']:
            raw_reviews = data['result']['reviews']
            # Formatear
            for r in raw_reviews:
                reviews.append({
                    'id': str(uuid.uuid4()), # Google no siempre da ID estable
                    'author': r.get('author_name'),
                    'initial': r.get('author_name')[0] if r.get('author_name') else 'A',
                    'stars': r.get('rating'),
                    'text': r.get('text'),
                    'date': r.get('relative_time_description')
                })
        
        print(f"Reviews found: {len(reviews)}")

        # 3. Guardar en Cache solo si hay datos
        if len(reviews) > 0:
            reviews_json = json.dumps(reviews)
            # Usamos REPLACE o UPDATE+INSERT. Como solo queremos 1 fila, limpiamos todo y ponemos 1.
            cursor.execute("TRUNCATE TABLE google_reviews_cache")
            cursor.execute("INSERT INTO google_reviews_cache (reviews_json) VALUES (%s)", (reviews_json,))
            conn.commit()
            print("Reviews saved to cache")
        else:
            print("No reviews found or API error, skipping cache update")
            # DEBUG: Devolver lo que Google respondió para ver el error
            # print(data) 
        
        cursor.close()
        conn.close()
        
        return jsonify(reviews)
        
    except Exception as e:
        print(f"Error fetching reviews: {e}")
        return jsonify({"error": str(e)}), 500

# --- CRUD MIEMBROS FAMILIA (CLIENTES FIELES) ---

@app.route('/api/admin/miembros', methods=['GET'])
def obtener_miembros():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM miembros_familia ORDER BY apellido, nombre")
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/miembros/<string:dni>', methods=['GET'])
def obtener_miembro(dni):
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM miembros_familia WHERE dni = %s", (dni,))
        data = cursor.fetchone()
        cursor.close()
        conn.close()
        if data:
            return jsonify(data)
        else:
            return jsonify(None), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/miembros', methods=['POST'])
def crear_miembro():
    try:
        data = request.json
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        query = """
            INSERT INTO miembros_familia (dni, nombre, apellido, direccion, telefono, email, fecha_nacimiento, sexo)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            data.get('dni'), data.get('nombre'), data.get('apellido'), 
            data.get('direccion'), data.get('telefono'), data.get('email'), 
            data.get('fecha_nacimiento'), data.get('sexo')
        )
        
        cursor.execute(query, values)
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Miembro agregado"}), 201
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/miembros/<string:dni>', methods=['PUT'])
def actualizar_miembro(dni):
    try:
        data = request.json
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        query = """
            UPDATE miembros_familia SET
                nombre=%s, apellido=%s, direccion=%s, telefono=%s, email=%s, fecha_nacimiento=%s, sexo=%s
            WHERE dni=%s
        """
        values = (
            data.get('nombre'), data.get('apellido'), data.get('direccion'), 
            data.get('telefono'), data.get('email'), data.get('fecha_nacimiento'), 
            data.get('sexo'), dni
        )
        
        cursor.execute(query, values)
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Miembro actualizado"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/miembros/<string:dni>', methods=['DELETE'])
def eliminar_miembro(dni):
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM miembros_familia WHERE dni = %s", (dni,))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Miembro eliminado"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Debug debe ser False en producción, pero True mientras desarrollas
    debug_mode = os.getenv('FLASK_ENV') == 'development'
    app.run(debug=debug_mode, port=5000)