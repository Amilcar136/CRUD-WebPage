const { useState, useEffect } = React;

const Editar = () => {
    const [productos, setProductos] = useState([]);
    const [productoEditando, setProductoEditando] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        precio: '',
        cantidad: '',
        categoria: ''
    });

    useEffect(() => {
        cargarProductos();
    }, []);

    const cargarProductos = async () => {
        try {
            const response = await fetch('/productos');
            const data = await response.json();
            setProductos(data);
        } catch (error) {
            console.error('Error al cargar productos:', error);
        }
    };

    const seleccionarProducto = (producto) => {
        setProductoEditando(producto.id);
        setFormData({
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: producto.cantidad,
            categoria: producto.categoria
        });
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`/productos/${productoEditando}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                alert('Producto actualizado exitosamente');
                setProductoEditando(null);
                setFormData({
                    nombre: '',
                    precio: '',
                    cantidad: '',
                    categoria: ''
                });
                cargarProductos();
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al actualizar producto');
        }
    };

    const cancelarEdicion = () => {
        setProductoEditando(null);
        setFormData({
            nombre: '',
            precio: '',
            cantidad: '',
            categoria: ''
        });
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
                {productoEditando ? (
                    <form className="crud-form" onSubmit={handleSubmit}>
                        <h2>Editar Producto</h2>

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

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button type="submit" className="btn-submit" style={{ flex: 1 }}>
                                Guardar Cambios
                            </button>
                            <button
                                type="button"
                                className="btn-submit"
                                style={{ flex: 1, backgroundColor: '#95a5a6' }}
                                onClick={cancelarEdicion}
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="table-container">
                        <h2>Editar Productos</h2>
                        <p style={{ marginBottom: '1rem', color: '#7f8c8d' }}>
                            Selecciona un producto para editarlo
                        </p>

                        {productos.length === 0 ? (
                            <p style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
                                No hay productos registrados
                            </p>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nombre</th>
                                        <th>Precio</th>
                                        <th>Cantidad</th>
                                        <th>Categoría</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productos.map(producto => (
                                        <tr key={producto.id}>
                                            <td>{producto.id}</td>
                                            <td>{producto.nombre}</td>
                                            <td>${producto.precio}</td>
                                            <td>{producto.cantidad}</td>
                                            <td>{producto.categoria}</td>
                                            <td>
                                                <button
                                                    className="btn-action btn-edit"
                                                    onClick={() => seleccionarProducto(producto)}
                                                >
                                                    Editar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>

            <footer className="footer">
                <p>&copy; 2024 Abarrotera Tecnológico - Sistema de Gestión</p>
            </footer>
        </div>
    );
};

// Renderizar el componente
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Editar />);