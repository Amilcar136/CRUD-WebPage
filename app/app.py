from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import psycopg2
import re

app = Flask(__name__, static_folder='static', template_folder='templates')
app.secret_key = 'password1234'
CORS(app)

DB_CONFIG = {
    'host': 'localhost',
    'database': 'Tienda_bat',
    'user': 'postgres',
    'password': 'Playa12321',
    'port': 5432
}

def get_db_connection():
    """Crea y retorna una conexión y un cursor a la base de datos."""
    conn = psycopg2.connect(**DB_CONFIG)
    return conn, conn.cursor()

def validar_email(email):
    "Valida formato de email"
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validar_password(password):
    """
    Valida contraseña con:
    -Minimo 8 caracteres, una mayuscula
    -Una minuscula y un numero
    """
    if len(password) < 8:
        return False, "La contraseña debe tener al menos 8 caracteres"
    if not re.search(r'[A-Z]', password):
        return False, "Debe de contener al menos una mayúscula"
    if not re.search(r'[a-z]', password):
        return False, "Debe contener al menos una minúscula"
    if not re.search(r'[0-9]', password):
        return False, "Debe contener al menos un número"
    return True, "Contraseña válida"

#   Ruta principal
@app.route('/')
def index():
    "Renderiza aplicacion React"
    return render_template('index.html')

@app.route('/api/status', methods = ['GET'])
def status():
    "Verifica estado de BD"
    try:
        conn, cursor = get_db_connection()
        cursor.execute('SELECT 1')
        cursor.close()
        conn.close()
        return jsonify( {
            'sucess' : True,
            'connected' : True,
            'message' : 'Base de datos conectada correctamente'
        }), 200
    except Exception as e:
        return jsonify({
            'sucess' : False,
            'connected' : False,
            'message' : f'Error de conexión: {str(e)}'
        }), 500

@app.route('/api/validar-email', methods = ['POST'])
def validar_email_endpoint():
    "Valida email en tiempo real"
    data = request.get_json()
    email = data.get('email', '')

    is_valid = validar_email(email)
    return jsonify({
        'valid' : is_valid,
        'message' : 'Email válido' if is_valid else 'Email inválido'
    }), 200

@app.route('/api/validate-password', methods=['POST'])
def validate_password_endpoint():
    """Valida la contraseña en tiempo real"""
    data = request.get_json()
    password = data.get('password', '')
    
    is_valid, message = validar_password(password)
    return jsonify({
        'valid': is_valid,
        'message': message
    }), 200

@app.route('/api/login', methods=['POST'])
def login():
    """Endpoint de autenticación"""
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({
            'success': False,
            'message': 'Faltan credenciales'
        }), 400
    
    if not validar_email(email):
        return jsonify({
            'success': False,
            'message': 'Formato de email inválido'
        }), 400
    conn, cursor = None, None
    try:
        conn, cursor = get_db_connection()
        cursor.execute('SELECT id, email, password_hash FROM usuarios WHERE email = %s', (email))
        user_record = cursor.fetchone()

        if user_record and user_record[2] == password:
            return jsonify({
                'success': True,
                'message': 'Inicio de sesión exitoso',
                'user': {
                    'id': user_record[0],
                    'email': user_record[1]
                }
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Credenciales incorrectas'
            }), 401

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error interno: {str(e)}'
        }), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

#PRODUCTOS
@app.route('/api/productos', methods=['GET'])
def get_productos():
    """Obtiene todos los productos"""
    try:
        conn, cursor = get_db_connection()
        cursor.execute("SELECT id, nombre, precio, stock FROM productos ORDER BY id")
        productos_tuplas = cursor.fetchall()
        cursor.close()
        conn.close()

        productos = [
            {
                'id': p[0],
                'nombre': p[1],
                'precio': float(p[2]),
                'stock': p[3]
            }
            for p in productos_tuplas
        ]

        return jsonify({
            'success': True,
            'productos': productos
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error al obtener productos: {str(e)}'
        }), 500

@app.route('/api/productos', methods=['POST'])
def crear_producto():
    """Crea un nuevo producto"""
    data = request.get_json()
    nombre = data.get('nombre')
    precio = data.get('precio')
    stock = data.get('stock')

    if not all([nombre, precio is not None, stock is not None]):
        return jsonify({
            'success': False,
            'message': 'Faltan datos requeridos'
        }), 400

    try:
        conn, cursor = get_db_connection()
        cursor.execute(
            "INSERT INTO productos (nombre, precio, stock) VALUES (%s, %s, %s) RETURNING id",
            (nombre, float(precio), int(stock))
        )
        nuevo_id = cursor.fetchone()[0]
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': f'Producto "{nombre}" creado exitosamente',
            'id': nuevo_id
        }), 201
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error al crear producto: {str(e)}'
        }), 500

@app.route('/api/productos/<int:producto_id>', methods=['PUT'])
def actualizar_producto(producto_id):
    """Actualiza un producto existente"""
    data = request.get_json()
    nombre = data.get('nombre')
    precio = data.get('precio')
    stock = data.get('stock')

    if not all([nombre, precio is not None, stock is not None]):
        return jsonify({
            'success': False,
            'message': 'Faltan datos requeridos'
        }), 400

    try:
        conn, cursor = get_db_connection()
        cursor.execute(
            "UPDATE productos SET nombre = %s, precio = %s, stock = %s WHERE id = %s",
            (nombre, float(precio), int(stock), producto_id)
        )
        conn.commit()
        
        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            return jsonify({
                'success': False,
                'message': 'Producto no encontrado'
            }), 404
        
        cursor.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': f'Producto "{nombre}" actualizado exitosamente'
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error al actualizar producto: {str(e)}'
        }), 500

@app.route('/api/productos/<int:producto_id>', methods=['DELETE'])
def eliminar_producto(producto_id):
    """Elimina un producto"""
    try:
        conn, cursor = get_db_connection()
        cursor.execute("DELETE FROM productos WHERE id = %s", (producto_id,))
        conn.commit()
        
        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            return jsonify({
                'success': False,
                'message': 'Producto no encontrado'
            }), 404
        
        cursor.close()
        conn.close()

        return jsonify({
            'success': True,
            'message': f'Producto con ID {producto_id} eliminado exitosamente'
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error al eliminar producto: {str(e)}'
        }), 500
    
if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
