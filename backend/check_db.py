import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

db_config = {
    'host': os.getenv('DB_HOST'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME')
}

try:
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor(dictionary=True)
    
    print("--- CATEGORIAS ---")
    cursor.execute("SELECT * FROM categorias")
    for r in cursor.fetchall():
        print(r)

    print("\n--- SUBCATEGORIAS ---")
    cursor.execute("SELECT * FROM subcategorias")
    for r in cursor.fetchall():
        print(r)

    conn.close()
except Exception as e:
    print(f"Error: {e}")
