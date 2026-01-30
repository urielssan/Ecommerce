import pandas as pd
import mysql.connector
import re

# --- CONFIGURACIÓN ---
NOMBRE_ARCHIVO = 'tienda nube productos 25 del 11.csv'

db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': 'Cafecita123',  # Tu contraseña
    'database': 'garciavidal'
}



def importar_datos():
    print("--- INICIANDO IMPORTACIÓN ---")
    
    # 1. Leer el CSV (Probamos encoding utf-8, si falla probamos latin1)
    try:
        df = pd.read_csv(NOMBRE_ARCHIVO, encoding='utf-8')
    except UnicodeDecodeError:
        df = pd.read_csv(NOMBRE_ARCHIVO, encoding='latin1')
    
    # Llenar valores nulos para evitar errores
    df = df.fillna('')

    # 1.1 Limpiar productos con nombre vacío (espacios, vacío o faltante)
    if 'Nombre' in df.columns:
        before_count = len(df)
        df = df[df['Nombre'].astype(str).str.strip() != '']
        after_count = len(df)
        removed_count = before_count - after_count
        print(f"Productos con nombre vacío removidos: {removed_count}. Productos restantes: {after_count}.")
    else:
        print("Advertencia: La columna 'Nombre' no existe en el CSV. No se aplicó filtro por nombre vacío.")

    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        print(f"Archivo leído. Procesando {len(df)} productos...")

        for index, row in df.iterrows():
            # --- A. LIMPIEZA DE DATOS ---
            nombre_original = row.get('Nombre', 'Sin Nombre')
            nombre_final = nombre_original.strip()
            
            descripcion = row.get('Descripción', '')
            seo_desc = row.get('Descripción SEO', '')
            tags = row.get('Tags', '')
            precio = row.get('Precio', 0)
            if precio == '': precio = 0
            
            # Mapeo de gramos a valor_propiedad_1
            peso = row.get('Peso', '') # Asumiendo que la columna se llama 'Peso' en el CSV
            valor_prop1 = str(peso) if peso else ''
            
            # --- B. GESTIÓN DE CATEGORÍAS (Padre > Hijo) ---
            # Tienda Nube suele poner "Padre > Hijo" en la columna Categorías
            cat_string = str(row.get('Categorías', ''))
            categorias = [c.strip() for c in cat_string.split('>')]
            
            id_categoria_padre = 1 # Default: General
            id_subcategoria = 1    # Default: General
            
            if len(categorias) > 0 and categorias[0]:
                nombre_cat = categorias[0]
                # 1. Buscar o crear Categoría Padre
                cursor.execute("SELECT idCategoria FROM categorias WHERE nombre = %s", (nombre_cat,))
                resultado = cursor.fetchone()
                if resultado:
                    id_categoria_padre = resultado[0]
                else:
                    cursor.execute("INSERT INTO categorias (nombre) VALUES (%s)", (nombre_cat,))
                    id_categoria_padre = cursor.lastrowid

                # 2. Buscar o crear Subcategoría (Hijo)
                if len(categorias) > 1:
                    nombre_sub = categorias[1]
                else:
                    nombre_sub = "General" # Si no tiene hijo, va a General de esa categoría
                
                cursor.execute("SELECT idSubcategoria FROM subcategorias WHERE nombre = %s AND fk_idCategoria = %s", (nombre_sub, id_categoria_padre))
                resultado_sub = cursor.fetchone()
                if resultado_sub:
                    id_subcategoria = resultado_sub[0]
                else:
                    cursor.execute("INSERT INTO subcategorias (nombre, fk_idCategoria) VALUES (%s, %s)", (nombre_sub, id_categoria_padre))
                    id_subcategoria = cursor.lastrowid
            
            # --- C. INSERTAR PRODUCTO ---
            # Usamos INSERT IGNORE por si corres el script 2 veces no duplicar errores
            sql_producto = """
                INSERT INTO productos 
                (NombresProductos, descripcion, descripcionProducto, Precio, 
                 valor_propiedad_1, nombre_propiedad_1, tags, seo_descripcion, marca, fk_idSubcategoria)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            
            # 'descripcion' es la corta, 'descripcionProducto' la larga. 
            # Tienda Nube solo suele dar una larga, así que usamos esa para ambas o recortamos.
            desc_corta = (descripcion[:97] + '...') if len(descripcion) > 100 else descripcion
            
            val_marca = row.get('Marca', 'Familia Garcia Vidal')
            if not val_marca: val_marca = 'Familia Garcia Vidal'

            valores = (
                nombre_final,
                desc_corta, 
                descripcion, 
                precio,
                valor_prop1,
                'Peso',          # Nombre propiedad 1 fijo
                tags,
                seo_desc,
                val_marca,
                id_subcategoria
            )
            
            cursor.execute(sql_producto, valores)

        conn.commit()
        print("¡IMPORTACIÓN FINALIZADA CON ÉXITO!")
        
    except mysql.connector.Error as err:
        print(f"Error de SQL: {err}")
    except Exception as e:
        print(f"Error general: {e}")
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

if __name__ == "__main__":
    importar_datos()