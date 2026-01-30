import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AboutPage from './pages/AboutPage';
import CredoPage from './pages/CredoPage';
import JoinFamilyPage from './pages/JoinFamilyPage';
import LocalesPage from './pages/LocalesPage';
import ContactPage from './pages/ContactPage';
import styles from './App.module.css';
import ShippingPage from './pages/ShippingPage';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import CheckoutPage from './pages/CheckoutPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className={styles.App}>
          <Navbar />

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/productos" element={<ProductsPage />} />
            <Route path="/producto/:id" element={<ProductDetailPage />} />

            {/* Rutas de las páginas institucionales */}
            <Route path="/envios" element={<ShippingPage />} />
            <Route path="/locales" element={<LocalesPage />} />
            <Route path="/nosotros" element={<AboutPage />} />
            <Route path="/contacto" element={<ContactPage />} />
            <Route path="/credo" element={<CredoPage />} />
            <Route path="/familia" element={<JoinFamilyPage />} />

            {/* Rutas de Administración */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminPage />} />

            {/* Checkout */}
            <Route path="/checkout" element={<CheckoutPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;