import mysql.connector
from mysql.connector import Error

# DATOS A PROBAR (Reemplaza con los tuyos)
config = {
    'host': 'localhost',
    'port': 3306,             # Por defecto es 3306
    'user': 'root',           # O el usuario que estés usando
    'password': 'Cafecita123', # <--- OJO AQUÍ
    'database': 'garciavidal' # El nombre exacto de tu Schema en Workbench
}

print("--- INICIANDO PRUEBA DE CONEXIÓN ---")

try:
    connection = mysql.connector.connect(**config)
    
    if connection.is_connected():
        db_info = connection.get_server_info()
        print(f"¡ÉXITO! Conectado al servidor MySQL versión: {db_info}")
        
        cursor = connection.cursor()
        cursor.execute("SELECT DATABASE();")
        record = cursor.fetchone()
        print(f"Estás conectado a la base de datos: {record[0]}")
        
        # Prueba extra: ver si la tabla productos existe
        cursor.execute("SHOW TABLES LIKE 'productos';")
        result = cursor.fetchone()
        if result:
            print("Verificación final: La tabla 'productos' EXISTE.")
        else:
            print("ADVERTENCIA: Conectaste a la BD, pero la tabla 'productos' NO existe.")

except Error as e:
    print("\nXXX ERROR ENCONTRADO XXX")
    print(f"Código de error: {e.errno}")
    print(f"Mensaje: {e.msg}")
    print("--------------------------")
    
    # Ayuda para interpretar el error
    if e.errno == 1045:
        print("-> PISTA: La contraseña o el usuario son incorrectos.")
    elif e.errno == 1049:
        print(f"-> PISTA: La base de datos '{config['database']}' no existe. Revisa el nombre en Workbench.")
    elif e.errno == 2003:
        print("-> PISTA: No se encuentra el servidor. ¿Está MySQL corriendo? ¿Es el puerto 3306?")

finally:
    if 'connection' in locals() and connection.is_connected():
        connection.close()
        print("\nConexión cerrada.")