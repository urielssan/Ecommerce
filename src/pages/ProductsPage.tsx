import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Product, Category, Subcategory } from '../types';
import styles from './styles/ProductsPage.module.css';

const ProductsPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);

    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

    const [loading, setLoading] = useState<boolean>(true);

    // URL por defecto (Primera imagen del carrusel de Home)
    const DEFAULT_BANNER = 'https://acdn-us.mitiendanube.com/stores/002/088/259/themes/rio/2-slide-1764953462902-5955549890-25a75488059a86f9c3875690628865231764953464-1920-1920.webp?1208621400';

    // Banner info
    const [bannerTitle, setBannerTitle] = useState('Todos los Productos');
    const [bannerImage, setBannerImage] = useState<string | null>(DEFAULT_BANNER);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resProd, resCat, resSub] = await Promise.all([
                    fetch('http://localhost:5000/api/productos'),
                    fetch('http://localhost:5000/api/categorias'),
                    fetch('http://localhost:5000/api/subcategorias')
                ]);

                const productsData = await resProd.json();
                const categoriesData = await resCat.json();
                const subcategoriesData = await resSub.json();

                setAllProducts(productsData);
                setCategories(categoriesData);
                setSubcategories(subcategoriesData);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Efecto para filtrar cuando cambian los datos o la URL
    useEffect(() => {
        if (loading) return;

        const catParam = searchParams.get('cat');
        const subParam = searchParams.get('sub');
        const searchParam = searchParams.get('search');

        let filtered = [...allProducts];
        let title = 'Todos los Productos';
        let img = DEFAULT_BANNER; // Por defecto el banner del home

        if (searchParam) {
            // Filtrar por búsqueda (nombre o descripción)
            const term = searchParam.toLowerCase();
            filtered = filtered.filter(p =>
                p.NombresProductos.toLowerCase().includes(term) ||
                (p.descripcion && p.descripcion.toLowerCase().includes(term))
            );
            title = `Resultados para: "${searchParam}"`;

        } else if (subParam) {
            // Filtrar por subcategoría
            filtered = filtered.filter(p => p.nombre_subcategoria === subParam);
            title = subParam;
            const subVals = subcategories.find(s => s.nombre === subParam);
            // Si tiene imagen específica, la usamos, sino queda la default
            if (subVals?.imagen_url) img = subVals.imagen_url;

        } else if (catParam) {
            // Filtrar por categoría
            filtered = filtered.filter(p => p.nombre_categoria === catParam);
            title = catParam;
            const catVals = categories.find(c => c.nombre === catParam);
            // Si tiene imagen específica, la usamos, sino queda la default
            if (catVals?.imagen_url) img = catVals.imagen_url;
        }

        setDisplayedProducts(filtered);
        setBannerTitle(title);
        setBannerImage(img);

    }, [loading, allProducts, categories, subcategories, searchParams]);

    // Función para manejar el clic en el sidebar (filtro por categoría)
    const handleCategoryClick = (categoryName: string | null) => {
        if (categoryName) {
            setSearchParams({ cat: categoryName });
        } else {
            setSearchParams({});
        }
    };

    return (
        <div className={styles['catalog-container']}>
            {/* Sidebar Dinámico */}
            <aside className={styles['filters-sidebar']}>
                <h3>Categorías</h3>
                <ul>
                    <li
                        className={!searchParams.get('cat') && !searchParams.get('sub') ? styles['active-filter'] : ''}
                        onClick={() => handleCategoryClick(null)}
                    >
                        Todos los productos
                    </li>
                    {categories.map(cat => (
                        <li
                            key={cat.idCategoria}
                            className={searchParams.get('cat') === cat.nombre ? styles['active-filter'] : ''}
                            onClick={() => handleCategoryClick(cat.nombre)}
                        >
                            {cat.nombre}
                        </li>
                    ))}
                </ul>
            </aside>

            <main className={styles['catalog-content']}>
                {/* BANNER DE CABECERA (Si existe imagen) */}
                {bannerImage && (
                    <div className={styles['catalog-banner']} style={{ backgroundImage: `url(${bannerImage})` }}>
                        <div className={styles['banner-overlay']}>
                            <h1>{bannerTitle}</h1>
                        </div>
                    </div>
                )}

                {/* Header simple si no hay banner image, o como complemento */}
                {!bannerImage && (
                    <header className={styles['catalog-header']}>
                        <h1>{bannerTitle}</h1>
                        <span>{displayedProducts.length} resultados</span>
                    </header>
                )}

                {/* Mostrar conteo si hay banner */}
                {bannerImage && (
                    <div className={styles['results-count']}>
                        <span>{displayedProducts.length} productos encontrados</span>
                    </div>
                )}

                {loading ? (
                    <div className={styles.loader}>Cargando...</div>
                ) : (
                    <div className={styles['products-grid']}>
                        {displayedProducts.map(prod => (
                            <Link
                                key={prod.idProductos}
                                to={`/producto/${prod.idProductos}`}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                                <ProductCard product={prod} />
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default ProductsPage;
