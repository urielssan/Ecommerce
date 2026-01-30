import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import styles from './styles/ProductDetailPage.module.css';
import { useCart } from '../context/CartContext';
import { FaTruck, FaLock } from 'react-icons/fa';
import { getGoogleDriveDirectLink } from '../utils';

const ProductDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`http://localhost:5000/api/productos/${id}`)
            .then(res => res.json())
            .then(data => {
                setProduct(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    const handleAddToCart = () => {
        if (product) {
            addToCart(product, quantity);
        }
    };

    if (loading) return <div className={styles.loader}>Cargando producto...</div>;
    if (!product) return <div>Producto no encontrado</div>;

    // Formatear precio
    const precio = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(product.Precio);
    const cuota = (product.Precio / 3).toLocaleString('es-AR', { maximumFractionDigits: 2 });

    const imageUrl = getGoogleDriveDirectLink(product.UrlImagen);

    return (
        <div className={styles['detail-container']}>
            {/* 1. Breadcrumb (Ruta de navegación) */}
            <nav className={styles.breadcrumb}>
                <Link to="/">Inicio</Link> &rsaquo;
                <Link to="/productos">Productos</Link> &rsaquo;
                <span>{product.nombre_categoria || 'General'}</span> &rsaquo;
                <span className={styles.current}>{product.NombresProductos}</span>
            </nav>

            <div className={styles['detail-grid']}>
                {/* 2. Columna Izquierda: Imagen */}
                <div className={styles['detail-image-section']}>
                    <div className={styles['main-image-placeholder']}>
                        {imageUrl ? (
                            <img src={imageUrl} alt={product.NombresProductos} className={styles['detail-main-img']} />
                        ) : (
                            <span>{product.NombresProductos.charAt(0)}</span>
                        )}
                    </div>
                </div>

                {/* 3. Columna Derecha: Información de Compra */}
                <div className={styles['detail-info-section']}>
                    <h1 className={styles['detail-title']}>{product.NombresProductos}</h1>

                    {product.marca && <div className={styles['detail-brand']}>Marca: {product.marca}</div>}

                    <div className={styles['detail-price-block']}>
                        <span className={styles['detail-price']}>{precio}</span>
                        <div className={styles['detail-installments']}>
                            3 cuotas sin interés de <strong>${cuota}</strong>
                        </div>
                        <a href="#" className={styles['payment-methods']}>Ver medios de pago</a>
                    </div>

                    <div className={styles['purchase-controls']}>
                        <label>Cantidad:</label>
                        <div className={styles['qty-selector']}>
                            <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                            <input type="number" value={quantity} readOnly />
                            <button onClick={() => setQuantity(q => q + 1)}>+</button>
                        </div>
                    </div>

                    <button className={styles['btn-add-cart-large']} onClick={handleAddToCart}>
                        AGREGAR AL CARRITO
                    </button>

                    {/* Mensajes de confianza */}
                    <div className={styles['trust-badges']}>
                        <p><FaTruck style={{ marginRight: '5px' }} /> Envíos a todo el país</p>
                        <p><FaLock style={{ marginRight: '5px' }} /> Compra protegida</p>
                    </div>
                </div>
            </div>

            {/* 4. Descripción Larga y Detalles */}



            <div className={styles['description-content']}>
                <div className={styles['spec-grid']}>
                    {/* Descripción (Con el mismo estilo que los demás items) */}
                    {(product.descripcionProducto || product.descripcion) && (
                        <div className={`${styles['spec-item']} ${styles['full-width']}`}>
                            <strong>Descripción:</strong>
                            <div dangerouslySetInnerHTML={{ __html: product.descripcionProducto || product.descripcion }} />
                        </div>
                    )}

                    {product.IngredientesSugeridos && (
                        <div className={`${styles['spec-item']} ${styles['mid-width']}`}>
                            <strong>Ingredientes Sugeridos:</strong>
                            <span>{product.IngredientesSugeridos}</span>
                        </div>
                    )}

                    {product.marca && (
                        <div className={styles['spec-item']}>
                            <strong>Marca:</strong>
                            <span>{product.marca}</span>
                        </div>
                    )}

                    {product.valor_propiedad_1 && (
                        <div className={styles['spec-item']}>
                            <strong>{product.nombre_propiedad_1 || 'Propiedad'}:</strong>
                            <span>{product.valor_propiedad_1}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>

    );
};

export default ProductDetailPage;
