import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Category } from '../types';
import styles from './styles/Navbar.module.css';
import { useCart } from '../context/CartContext';
import { FaSearch, FaShoppingCart, FaChevronDown } from 'react-icons/fa';

// Definimos una interfaz ligera para el buscador
interface ProductSearchItem {
    idProductos: number;
    nombre: string;
    categoria: string;
    // Agrega 'url_imagen' si quieres mostrar foto pequeña en el buscador
}

const Navbar: React.FC = () => {
    // Estados generales
    const [categories, setCategories] = useState<Category[]>([]);
    const { totalItems } = useCart();
    const navigate = useNavigate();

    // Estados para la búsqueda
    const [allProducts, setAllProducts] = useState<ProductSearchItem[]>([]); // Base de datos local
    const [filteredResults, setFilteredResults] = useState<ProductSearchItem[]>([]); // Resultados a mostrar
    const [searchTerm, setSearchTerm] = useState('');

    // --- EFECTOS ---

    useEffect(() => {
        // 1. Cargar el Menú (Categorías)
        fetch('http://localhost:5000/api/menu')
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(err => console.error("Error cargando menú", err));

        // 2. Cargar índice de búsqueda (Carga única ligera)
        // Asegúrate de crear este endpoint en tu Flask que devuelva {id, nombre, categoria}
        fetch('http://localhost:5000/api/search-index')
            .then(res => res.json())
            .then(data => setAllProducts(data))
            .catch(err => console.error("Error cargando índice de búsqueda", err));
    }, []);

    // --- HANDLERS ---

    // Búsqueda en vivo (Live Search)
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);

        if (term.trim().length > 0) {
            // Filtramos el array local en memoria (¡Rapidísimo!)
            const results = allProducts.filter(product =>
                product.nombre.toLowerCase().includes(term.toLowerCase())
            );
            setFilteredResults(results);
        } else {
            setFilteredResults([]);
        }
    };

    // Búsqueda al dar ENTER (Búsqueda tradicional)
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/productos?search=${encodeURIComponent(searchTerm)}`);
            setFilteredResults([]); // Limpiamos sugerencias
        }
    };

    // Al hacer clic en una sugerencia
    const handleSuggestionClick = () => {
        setSearchTerm('');      // Opcional: limpiar el input
        setFilteredResults([]); // Cerrar lista
    };

    return (
        <header className={styles['navbar-container']}>
            {/* BARRA PRINCIPAL */}
            <div className={styles['main-header']}>
                <div className={`${styles.container} ${styles['main-header-content']}`}>
                    {/* Logo */}
                    <Link to="/" className={styles.logo}>
                        Garcia Vidal
                    </Link>

                    {/* Menú de Navegación */}
                    <nav className={styles['main-nav']}>
                        <ul className={styles['nav-links']}>
                            <li className={styles['nav-item']}><Link to="/nosotros" className={styles['nav-link']}>Nosotros</Link></li>
                            <li className={styles['nav-item']}><Link to="/contacto" className={styles['nav-link']}>Contacto</Link></li>
                            <li className={styles['nav-item']}><Link to="/credo" className={styles['nav-link']}>Nuestro Credo</Link></li>

                            <li className={`${styles['nav-item']} ${styles['dropdown-parent']}`}>
                                <Link to="/productos" className={`${styles['nav-link']} ${styles['main-link']}`}>
                                    PRODUCTOS <FaChevronDown size={12} style={{ marginLeft: '4px' }} />
                                </Link>
                                <div className={styles['dropdown-menu']}>
                                    <ul className={styles['category-list']}>
                                        {categories.map(cat => (
                                            <li key={cat.idCategoria} className={styles['category-item']}>
                                                <span className={styles['cat-title']}>{cat.nombre}</span>
                                                {cat.subcategorias.length > 0 && (
                                                    <ul className={styles['subcategory-list']}>
                                                        {cat.subcategorias.map(sub => (
                                                            <li key={sub.idSubcategoria}>
                                                                <Link to={`/productos?cat=${cat.nombre}&sub=${sub.nombre}`}>
                                                                    {sub.nombre}
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </li>
                            <li className={styles['nav-item']}><Link to="/envios" className={styles['nav-link']}>Envío a domicilio</Link></li>
                            <li className={styles['nav-item']}><Link to="/locales" className={styles['nav-link']}>Locales</Link></li>

                        </ul>
                    </nav>

                    {/* Acciones (Buscador + Carrito) */}
                    <div className={styles['header-actions']}>

                        {/* BUSCADOR SIEMPRE VISIBLE */}
                        <div className={`${styles['search-wrapper']} ${styles.active}`}>
                            <form onSubmit={handleSearchSubmit} className={styles['search-form']}>
                                <input
                                    type="text"
                                    className={styles['search-input']}
                                    placeholder="Buscar productos..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                />
                                <button type="submit" className={styles['search-submit']}>
                                    <FaSearch />
                                </button>

                                {/* LISTA FLOTANTE DE SUGERENCIAS */}
                                {filteredResults.length > 0 && (
                                    <div className={styles['search-suggestions']}>
                                        <ul>
                                            {filteredResults.slice(0, 8).map(prod => ( // Limitamos a 8 resultados
                                                <li key={prod.idProductos}>
                                                    <Link
                                                        to={`/producto/${prod.idProductos}`}
                                                        onClick={handleSuggestionClick}
                                                    >
                                                        <span className={styles['suggestion-name']}>{prod.nombre}</span>
                                                        <span className={styles['suggestion-cat']}>{prod.categoria}</span>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </form>
                        </div>


                        {/* Carrito */}
                        <button onClick={() => navigate('/checkout')} className={`${styles['cart-btn']} ${totalItems > 0 ? styles['active-cart'] : ''}`}>
                            <FaShoppingCart size={20} /> {totalItems > 0 && <span className={styles['cart-badge']}>{totalItems}</span>}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
