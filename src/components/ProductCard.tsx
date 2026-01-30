import React from 'react';
import { Product } from '../types';
import styles from './styles/ProductCard.module.css';
import { getGoogleDriveDirectLink } from '../utils';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const {
        NombresProductos,
        Precio,
        marca,
        valor_propiedad_1, // Peso
    } = product;

    const formatoPrecio = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0 // Generalmente en ARS no se usan centavos en vista rápida
    }).format(Precio);

    const imageUrl = getGoogleDriveDirectLink(product.UrlImagen);

    return (
        <div className={styles['product-card']}>
            {/* Etiquetas de oferta o stock (simulado con tags) */}
            <div className={styles['card-badges']}>
                {marca && <span className={`${styles.badge} ${styles['badge-brand']}`}>{marca}</span>}
            </div>

            <div className={styles['card-image-container']}>
                {imageUrl ? (
                    <div className={styles['product-image-wrapper']}>
                        <img
                            src={imageUrl}
                            alt={NombresProductos}
                            className={styles['product-img']}
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).nextElementSibling?.classList.remove(styles.hidden);
                            }}
                        />
                        <div className={`${styles['placeholder-img']} ${styles.hidden}`}>
                            <span>{NombresProductos.substring(0, 1)}</span>
                        </div>
                    </div>
                ) : (
                    <div className={styles['placeholder-img']}>
                        <span>{NombresProductos.substring(0, 1)}</span>
                    </div>
                )}
            </div>

            <div className={styles['card-info']}>
                <h3 className={styles['product-title']} title={NombresProductos}>
                    {NombresProductos}
                </h3>

                {/* Peso o unidad */}
                <p className={styles['product-weight']}>
                    {valor_propiedad_1 || 'Unidad'}
                </p>

                <div className={styles['price-block']}>
                    <span className={styles['current-price']}>{formatoPrecio}</span>
                </div>

                <div className={styles['card-actions']}>
                    <button className={styles['btn-buy']}>
                        AGREGAR AL CARRITO
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
