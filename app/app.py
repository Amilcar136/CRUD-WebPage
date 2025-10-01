from flask import Flask, render_template
import psycopg2
import os

app = Flask(__name__)

DB_CONFIG = {
    'host': 'localhost',
    'database': 'Tienda_bat',
    'user': 'postgres',
    'password': 'Playa12321',
    'port': 5432
}

def check_db_connection():
    """
    Función para verificar el estado de la conexión a la base de datos
    Retorna True si está conectada, False si no
    """
    try:
        # Intentar establecer conexión
        connection = psycopg2.connect(
            host=DB_CONFIG['host'],
            database=DB_CONFIG['database'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password'],
            port=DB_CONFIG['port']
        )
        
        # Crear cursor para ejecutar una consulta simple
        cursor = connection.cursor()
        cursor.execute('SELECT 1')
        
        # Cerrar cursor y conexión
        cursor.close()
        connection.close()
        
        return True
        
    except Exception as e:
        print(f"Error de conexión: {e}")
        return False

#   Ruta principal
@app.route('/')
def index():
    is_connected = check_db_connection()

    if is_connected:
        status_message = "Base de datos conectada"
        status_class = "sucess"
    else:
        status_message = "Base de datos desconectada"
        status_class = "error"
    return render_template('index.html', status_message=status_message, status_class=status_class)


@app.route('/status')
def status():
    is_connected = check_db_connection()

    return {
        'connected' : is_connected,
        'message' : 'Base de datos conectada' if is_connected else "Base de datos desconectada"
    }
    
@app.route('/formulario')
def form():
    return render_template('formulario.html')


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
