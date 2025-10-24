from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
from werkzeug.security import generate_password_hash, check_password_hash
import os

#inicializamos la app de flask
app = Flask(__name__)
app.secret_key = "Password1234"
CORS(app)

#Configuracion de BD
DB_CONFIG = {
    'host': 'localhost',
    'database': 'Tienda_bat',
    'user': 'postgres',
    'password': 'Playa12321'
}

def get_db_connection():
    conn = psycopg2.connect(**DB_CONFIG)
    return conn

#Ruta principal
@app.route('/')
def index():
    return render_template('index.html')

#Login
@app.route('/login', methods= ['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        conn = get_db_connection()
        cur = conn.cursor(cursor_factory = RealDictCursor)
        cur.execute('SELECT * FROM usuarios WHERE email = %s', (email,))
        user = cur.fetchone()
        cur.close()
        conn.close()

        if user and check_password_hash(user['password'], password):
            session['user_id'] = user['id']
            return jsonify( { 'sucess': True, 'message': 'Login exitoso!' })
        return jsonify( { 'sucess': False, 'message': 'Credenciales incorrectas'}), 401
    return render_template('login.html')

#Validacion del formulario
@app.route('/validar_email', methods= ['POST'])
def validar_email():
    data = request.get_json()
    email = data.get('email')

    #Validacion de email
    if '@' in email and '.' in email.split('@')[1]:
        return jsonify( {'valido': True})
    return jsonify( { 'valido': False})

@app.route('/validar_password', methods= ['POST'])
def validar_password():
    data = request.get_json()
    password = data.get('password')

    #Validacion minimo 6 caracteres
    if len(password) >= 6:
        return jsonify( { 'valido': True})
    return jsonify( { 'sucess': False})

@app.route('/productos', methods= ['GET', 'POST'])
def productos():
    if request.methods == 'POST':
        data = request.get_json()
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            'INSERT INTO productos (nombre, precio, cantidad, categoria) VALUES (%s, %s, %s, %s)',
            (data['nombre'], data['precio'], data['cantidad'], data['categoria'])
        )
        conn.commit()
        cur.close()
        conn.close()
        return jsonify( { 'sucess': True, 'message':'Producto agregado!'})
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory = RealDictCursor)
    cur.execute('SELECT * FROM productos ORDER BY id DESC')
    productos = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(productos)

@app.route('/productos/<int:id>', methods=['GET', 'PUT', 'DELETE'])
def producto_detalle(id):
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory = RealDictCursor)

    if request.method == 'DELETE':
        cur.execute('DELETE FROM productos WHERE id= %s', (id))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify( { 'sucess': True, 'message': 'Producto eliminado'})
    
    if request.method == 'PUT':
        data = request.get_json()
        cur.execute(
            'UPDATE productos SET nombre=%s, precio=%s, cantidad=%s, categoria=%s WHERE id=%s', 
            (data['nombre'], data['precio'], data['cantidad'], data['categoria'], id)
        )
        conn.commit()
        cur.close()
        conn.close()
        return jsonify( { 'sucess':True, 'message': 'Producto actualizado!'})
    
    cur.execute('SELECT * FROM productos WHERE id = %s', (id))
    producto = cur.fetchone()
    cur.close()
    conn.close()
    return jsonify(producto)

if __name__ == '__main__':
    app.run(debug=True, host= '0.0.0.0')