const { useState, useEffect } = React;

const Bajas = () => {
    const [productos, setProductos] = useState([]);

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

    const eliminarProducto = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este producto?')) {
            try {
                const response = await fetch(`/productos/${id}`, {
                    method: 'DELETE'
                });

                const data = await response.json();

                if (data.success) {
                    alert('Producto eliminado exitosamente');
                    cargarProductos();
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error al eliminar producto');
            }
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
                <div className="table-container">
                    <h2>Dar de Baja Productos</h2>
                    
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
                                                className="btn-action btn-delete"
                                                onClick={() => eliminarProducto(producto.id)}
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <footer className="footer">
                <p>&copy; 2024 Abarrotera Tecnológico - Sistema de Gestión</p>
            </footer>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Bajas />);