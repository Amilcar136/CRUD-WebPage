from flask import Flask, render_template, request, url_for, redirect, flash, jsonify
import psycopg2
import json

app = Flask(__name__)
app.secret_key = 'password1234'

DB_CONFIG = {
    'host': 'localhost',
    'database': 'Tienda_bat',
    'user': 'postgres',
    'password': 'Playa12321',
    'port': 5432
}

def get_db_connection():
    """
    Crea y retorna una conexión y un cursor a la base de datos.
    """
    conn = psycopg2.connect(**DB_CONFIG)
    return conn, conn.cursor()

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
    try:
        conn, cursor = get_db_connection()
        cursor.close()
        conn.close()
        flash("Base de datos conectada correctamente", "success")
    except Exception as e:
        flash("No se pudo conectar a la base de datos", "error")

    return render_template('index.html')

@app.route('/status')
def status():
    is_connected = check_db_connection()

    return {
        'connected' : is_connected,
        'message' : 'Base de datos conectada' if is_connected else "Base de datos desconectada"
    }

#   ALTAS
@app.route('/productos/alta', methods=['GET', 'POST'])
def altas_prod():
    if request.method == 'POST':
        # 1. Obtener datos del formulario
        nombre = request.form['product-name']
        precio = float(request.form['product-price'])
        stock = int(request.form['product-stock'])

        # 2. Conectarse y ejecutar la consulta SQL
        conn, cursor = get_db_connection()
        # Se usa %s para prevenir inyección SQL
        cursor.execute("INSERT INTO productos (nombre, precio, stock) VALUES (%s, %s, %s)", 
                       (nombre, precio, stock))
        conn.commit() # Confirma la transacción
        cursor.close()
        conn.close()
        
        flash(f'Producto "{nombre}" añadido con éxito!', 'success')
        return redirect(url_for('bajas_prod'))
    
    return render_template('altas.html')

#   BAJAS
@app.route('/productos/baja', methods=['GET', 'POST'])
def bajas_prod():
    conn, cursor = get_db_connection()
    if request.method == 'POST':
        product_id = int(request.form['product-id'])
        cursor.execute("DELETE FROM productos WHERE id = %s", (product_id,))
        conn.commit()
        flash(f'Producto con ID {product_id} eliminado.', 'danger')
        cursor.close()
        conn.close()
        return redirect(url_for('bajas_prod'))
    
    # Para el método GET, obtenemos todos los productos
    cursor.execute("SELECT id, nombre, precio, stock FROM productos ORDER BY id")
    productos_tuplas = cursor.fetchall()
    cursor.close()
    conn.close()

    # Convertimos las tuplas a diccionarios para que la plantilla HTML funcione igual
    productos = [{'id': p[0], 'nombre': p[1], 'precio': p[2], 'stock': p[3]} for p in productos_tuplas]
    
    return render_template('bajas.html', productos=productos)

#   ACTUALIZAR
@app.route('/productos/actualizar', methods=['GET', 'POST'])
def actualizar_prod():
    conn, cursor = get_db_connection()
    if request.method == 'POST':
        product_id = int(request.form['product-id'])
        nombre = request.form['product-name']
        precio = float(request.form['product-price'])
        stock = int(request.form['product-stock'])
        
        cursor.execute("UPDATE productos SET nombre = %s, precio = %s, stock = %s WHERE id = %s",
                       (nombre, precio, stock, product_id))
        conn.commit()
        flash(f'Producto "{nombre}" actualizado correctamente.', 'warning')
        cursor.close()
        conn.close()
        return redirect(url_for('actualizar_prod'))
        
    # Para el método GET, obtenemos todos los productos
    cursor.execute("SELECT id, nombre, precio, stock FROM productos ORDER BY id")
    productos_tuplas = cursor.fetchall()
    cursor.close()
    conn.close()

    # Convertimos las tuplas a diccionarios
    productos = [{'id': p[0], 'nombre': p[1], 'precio': p[2], 'stock': p[3]} for p in productos_tuplas]
    
    return render_template('actualizar.html', productos=productos)

@app.route('/login', methods=['POST'])
def login():
    # Asumimos que los datos vienen como JSON del JavaScript
    data = request.get_json() 
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'success': False, 'message': 'Faltan credenciales.'}), 400

    conn, cursor = None, None # Inicializar a None para el bloque finally
    try:
        conn, cursor = get_db_connection()
        cursor.execute("SELECT id, email, password_hash FROM usuarios WHERE email = %s", (email,))
        user_record = cursor.fetchone()

        if user_record:
            # Si encuentras el usuario y la contraseña coincide
            if user_record[2] == password:
                return jsonify({'success': True, 'message': 'Inicio de sesión exitoso!'})
            else:
                return jsonify({'success': False, 'message': 'Contraseña incorrecta.'}), 401
        else:
            return jsonify({'success': False, 'message': 'Usuario no encontrado.'}), 401

    except Exception as e:
        print(f"Error durante el login: {e}")
        return jsonify({'success': False, 'message': 'Error interno del servidor.'}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
