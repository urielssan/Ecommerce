import React, { useState, useEffect } from 'react';
import googleLogo from '../assets/google-logo.png';
import Carousel from '../components/Carousel';
import GoogleReviewsCarousel from '../components/GoogleReviewsCarousel';
import styles from './styles/HomePage.module.css';
import { Link } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaTruck } from 'react-icons/fa';
import { GiMeat } from 'react-icons/gi';

const HomePage: React.FC = () => {
  const carouselImages = [
    'https://acdn-us.mitiendanube.com/stores/002/088/259/themes/rio/2-slide-1764953462902-5955549890-25a75488059a86f9c3875690628865231764953464-1920-1920.webp?1208621400',
    'https://acdn-us.mitiendanube.com/stores/002/088/259/themes/rio/2-slide-1750861485926-744701044-26d5e8ac186a80a4fed1b678a9b040911750861487-1920-1920.webp?1208621400',
    'https://acdn-us.mitiendanube.com/stores/002/088/259/themes/rio/2-slide-1750861485926-6384842177-b52e1e136872ef03e9a863665ac77a7c1750861488-1920-1920.webp?1208621400',
    'https://acdn-us.mitiendanube.com/stores/002/088/259/themes/rio/2-slide-1750785547263-8009484505-6fb3224e7cf9b4811b1a8554ed7bcb9d1750785551-1920-1920.webp?1208621400'
  ];
  const GOOGLE_REVIEWS_LINK = "https://www.google.com/maps/place/Familia+Garcia+Vidal/";

  // Estado para subcategorías (Burbujas)
  const [subcategories, setSubcategories] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/subcategorias')
      .then(res => res.json())
      .then(data => {
        // Opcional: Filtrar o limitar cantidad si son demasiadas
        setSubcategories(data);
      })
      .catch(err => console.error("Error fetching subcategories:", err));
  }, []);

  // Helper para asignar imágenes a subcategorías
  const getSubcategoryImage = (name: string) => {
    const n = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (n.includes('milanesa')) return 'https://images.unsplash.com/photo-1599921841143-819065f563bf?auto=format&fit=crop&w=200&q=80';
    if (n.includes('hamburguesa')) return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80';
    if (n.includes('carne') || n.includes('bife') || n.includes('lomo')) return 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=200&q=80';
    if (n.includes('pollo') || n.includes('suprema')) return 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=200&q=80';
    if (n.includes('cerdo') || n.includes('bondiola') || n.includes('matambre')) return 'https://images.unsplash.com/photo-1602498456745-e9503b30470b?auto=format&fit=crop&w=200&q=80';
    if (n.includes('pizza')) return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=200&q=80';
    if (n.includes('empanada')) return 'https://images.unsplash.com/photo-1619250914856-558296a2472e?auto=format&fit=crop&w=200&q=80';
    if (n.includes('vino') || n.includes('bebida') || n.includes('cerveza')) return 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=200&q=80';
    if (n.includes('verdura') || n.includes('ensalada')) return 'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=200&q=80';
    if (n.includes('pan') || n.includes('factura')) return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=200&q=80';
    if (n.includes('fiambre') || n.includes('queso')) return 'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?auto=format&fit=crop&w=200&q=80';
    if (n.includes('guiso')) return 'https://images.unsplash.com/photo-1547592166-23acbe346499?auto=format&fit=crop&w=200&q=80';

    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80'; // Generic food
  };

  return (
    <div className={styles['home-page']}>
      <Carousel images={carouselImages} autoPlayInterval={5000} />

      {/* SECCIÓN DE BURBUJAS DE SUBCATEGORÍAS */}
      <section className={styles['bubbles-section']}>
        <div className={styles['bubbles-scroll-container']}>
          {subcategories.map((sub) => (
            <Link to={`/productos?sub=${sub.nombre}`} className={styles['bubble-item']} key={sub.idSubcategoria}>
              <div className={styles['bubble-image-wrapper']}>
                <img
                  src={sub.imagen_url || getSubcategoryImage(sub.nombre)}
                  alt={sub.nombre}
                  onError={(e) => {
                    // Fallback si la imagen de DB rompe
                    e.currentTarget.src = getSubcategoryImage(sub.nombre);
                  }}
                />
              </div>
              <span className={styles['bubble-title']}>{sub.nombre}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className={styles['home-container']}>

        {/* 1. HERO VIDEO SECTION */}
        <section className={styles['hero-video-wrapper']}>
          <div className={styles['video-responsive']}>
            <iframe
              src="https://www.youtube.com/embed/586cbhkJixs?autoplay=1&mute=1&controls=0&loop=1&playlist=586cbhkJixs&modestbranding=1&rel=0&playsinline=1&vq=hd1080"
              title="Familia García Vidal - VIDEO INSTITUCIONAL"
              frameBorder="0"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </section>

        {/* 2. SECCIÓN DE CONFIANZA (GOOGLE) */}
        <section className={styles['social-proof-section']}>
          <div className={styles['google-review-card-wrapper']}>
            <div className={styles['google-header-main']}>
              <img
                src={googleLogo}
                alt="Google Logo"
                style={{ width: '30px', height: '30px' }}
              />
              <div style={{ textAlign: 'left' }}>
                <h3>Familia Garcia Vidal</h3>
                <div className={styles['rating-row']}>
                  <span style={{ fontWeight: 'bold', color: '#333' }}>4.9</span>
                  <div className={styles.stars}>
                    <FaStar size={14} /><FaStar size={14} /><FaStar size={14} /><FaStar size={14} /><FaStar size={14} />
                  </div>
                </div>
              </div>
            </div>

            <GoogleReviewsCarousel />

            <div style={{ marginTop: '20px' }}>
              <a
                href={GOOGLE_REVIEWS_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className={styles['btn-google']}
              >
                Ver todas las opiniones
              </a>
            </div>
          </div>
        </section>

        {/* 3. ACCESOS RÁPIDOS (Opcional, para no dejar la home vacía) */}
        <section className={styles['quick-links']}>
          <h2>¿Qué estás buscando hoy?</h2>
          <div className={styles['quick-grid']}>
            <Link to="/productos" className={styles['quick-card']}><GiMeat style={{ marginRight: '8px' }} /> Cortes de Carne</Link>
            <Link to="/envios" className={styles['quick-card']}><FaTruck style={{ marginRight: '8px' }} /> Zonas de Envío</Link>
            <Link to="/locales" className={styles['quick-card']}><FaMapMarkerAlt style={{ marginRight: '8px' }} /> Nuestros Locales</Link>
          </div>
        </section>

      </div>
    </div>
  );
};

export default HomePage;
