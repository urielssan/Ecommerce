import os
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

db_config = {
    'host': os.getenv('DB_HOST'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME')
}

def fix_db():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        print("Intentando agregar columnas imagen_url...")

        try:
            cursor.execute("ALTER TABLE categorias ADD COLUMN imagen_url TEXT")
            print("Columna imagen_url agregada a categorias.")
        except Exception as e:
            print(f"categorias: {e}")

        try:
            cursor.execute("ALTER TABLE subcategorias ADD COLUMN imagen_url TEXT")
            print("Columna imagen_url agregada a subcategorias.")
        except Exception as e:
            print(f"subcategorias: {e}")

        conn.commit()
        cursor.close()
        conn.close()
        print("Backup migration finished.")
    except Exception as e:
        print(f"Connection error: {e}")

if __name__ == "__main__":
    fix_db()
