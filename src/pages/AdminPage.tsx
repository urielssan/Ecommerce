import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProductCrud from '../components/admin/ProductCrud';
import CategoryCrud from '../components/admin/CategoryCrud';
import SubcategoryCrud from '../components/admin/SubcategoryCrud';
import OrdersList from '../components/admin/OrdersList';
import FamilyMembersCrud from '../components/admin/FamilyMembersCrud';
import OrderTaker from '../components/admin/OrderTaker';
import StockManager from '../components/admin/StockManager';
import styles from './styles/AdminPage.module.css';

import { FaClipboardList, FaBoxOpen, FaFolder, FaTags, FaSignOutAlt, FaUsers, FaCashRegister, FaBoxes } from 'react-icons/fa';

const AdminPage: React.FC = () => {
    const { isAuthenticated, logout, user } = useAuth();
    const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'subcategories' | 'orders' | 'family' | 'pos' | 'stock'>('orders');

    // Si no está autenticado, redirigir a Login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className={styles['admin-container']}>
            <aside className={styles['admin-sidebar']}>
                <div className={styles['sidebar-header']}>
                    <h3>Admin Panel</h3>
                    <p>Hola, {user || 'Admin'}</p>
                </div>
                <nav className={styles['sidebar-nav']}>
                    <button
                        className={activeTab === 'pos' ? styles.active : ''}
                        onClick={() => setActiveTab('pos')}
                    >
                        <FaCashRegister style={{ marginRight: '8px' }} /> Tomar Pedido
                    </button>
                    <button
                        className={activeTab === 'orders' ? styles.active : ''}
                        onClick={() => setActiveTab('orders')}
                    >
                        <FaClipboardList style={{ marginRight: '8px' }} /> Pedidos
                    </button>
                    <button
                        className={activeTab === 'products' ? styles.active : ''}
                        onClick={() => setActiveTab('products')}
                    >
                        <FaBoxOpen style={{ marginRight: '8px' }} /> Productos
                    </button>
                    <button
                        className={activeTab === 'categories' ? styles.active : ''}
                        onClick={() => setActiveTab('categories')}
                    >
                        <FaFolder style={{ marginRight: '8px' }} /> Categorías
                    </button>
                    <button
                        className={activeTab === 'subcategories' ? styles.active : ''}
                        onClick={() => setActiveTab('subcategories')}
                    >
                        <FaTags style={{ marginRight: '8px' }} /> Subcategorías
                    </button>
                    <button
                        className={activeTab === 'stock' ? styles.active : ''}
                        onClick={() => setActiveTab('stock')}
                    >
                        <FaBoxes style={{ marginRight: '8px' }} /> Stock
                    </button>
                    <button
                        className={activeTab === 'family' ? styles.active : ''}
                        onClick={() => setActiveTab('family')}
                    >
                        <FaUsers style={{ marginRight: '8px' }} /> Clientes Fieles
                    </button>
                    <button onClick={logout} className={styles['logout-btn']}>
                        <FaSignOutAlt style={{ marginRight: '8px' }} /> Cerrar Sesión
                    </button>
                </nav>
            </aside>
            <main className={styles['admin-main']}>
                <header className={styles['main-header']}>
                    <h2>
                        {activeTab === 'orders' && 'Gestión de Pedidos'}
                        {activeTab === 'products' && 'Gestión de Productos'}
                        {activeTab === 'categories' && 'Gestión de Categorías'}
                        {activeTab === 'subcategories' && 'Gestión de Subcategorías'}
                        {activeTab === 'family' && 'Clientes Fieles'}
                        {activeTab === 'pos' && 'Punto de Venta'}
                        {activeTab === 'stock' && 'Gestión de Stock'}
                    </h2>
                </header>
                <div className={styles['content-area']}>
                    {activeTab === 'orders' && <OrdersList />}
                    {activeTab === 'products' && <ProductCrud />}
                    {activeTab === 'categories' && <CategoryCrud />}
                    {activeTab === 'subcategories' && <SubcategoryCrud />}
                    {activeTab === 'family' && <FamilyMembersCrud />}
                    {activeTab === 'pos' && <OrderTaker onOrderCreated={() => setActiveTab('orders')} />}
                    {activeTab === 'stock' && <StockManager />}
                </div>
            </main>
        </div>
    );
};

export default AdminPage;
