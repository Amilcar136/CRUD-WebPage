const { useState } = React;

const Altas = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        precio: '',
        cantidad: '',
        categoria: ''
    });

    const [mensaje, setMensaje] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('/productos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.sucess) {
                setMensaje('Producto agregado exitosamente!')
                setFormData({
                    nombre: '',
                    precio: '',
                    cantidad: '',
                    categoria: ''
                });

                setTimeout(() => setMensaje(''), 3000);
            }
        } catch (error) {
            console.error('Error: ', error);
            setMensaje('Error al agregar el producto');
        }
    };

    return (
        <div>
            <nav className="navbar">
                <div className="nav-container">
                    <div className="nav-brand">Abarrotera Tecnológico</div>
                    <ul className="nav-menu">
                        <li><a href="/">Inicio</a></li>
                        <li><a href="/altas.html">Altas</a></li>
                        <li><a href="/bajas.html">Bajas</a></li>
                        <li><a href="/editar.html">Editar</a></li>
                        <li><a href="/login" className="login-btn">Login</a></li>
                    </ul>
                </div>
            </nav>

            <div className="crud-container">
                <form className="crud-form" onSubmit={handleSubmit}>
                    <h2>Dar de Alta Producto</h2>
                    
                    {mensaje && (
                        <div style={{
                            padding: '1rem',
                            backgroundColor: '#d4edda',
                            color: '#155724',
                            borderRadius: '4px',
                            marginBottom: '1rem'
                        }}>
                            {mensaje}
                        </div>
                    )}

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="nombre">Nombre del Producto</label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="precio">Precio</label>
                            <input
                                type="number"
                                step="0.01"
                                id="precio"
                                name="precio"
                                value={formData.precio}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="cantidad">Cantidad</label>
                            <input
                                type="number"
                                id="cantidad"
                                name="cantidad"
                                value={formData.cantidad}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="categoria">Categoría</label>
                            <input
                                type="text"
                                id="categoria"
                                name="categoria"
                                value={formData.categoria}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-submit">
                        Agregar Producto
                    </button>
                </form>
            </div>

            <footer className="footer">
                <p>&copy; 2025 Abarrotera Tecnológico - Sistema de Gestión</p>
            </footer>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<Altas />);