import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './styles/AboutPage.module.css';
import { FaSeedling, FaTractor, FaUtensils, FaFire, FaTruck, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

import productionSteers from '../assets/production_steers.png';
import productionPigs from '../assets/production_pigs.png';
import productionChickens from '../assets/production_chickens.png';
import productionEggs from '../assets/production_eggs.png';
import productionHarvest from '../assets/production_harvest.png';
import productionWater from '../assets/production_water.png';

const productionItems = [
  { id: 1, image: productionSteers, text: "Novillos y Corderos a pasto, criados con respeto." },
  { id: 2, image: productionPigs, text: "Cerdos de Campo, libres y alimentados con granos propios." },
  { id: 3, image: productionChickens, text: "Pollos libres, creciendo al sol y sin antibióticos." },
  { id: 4, image: productionEggs, text: "Huevos de campo recién recolectados de gallinas felices." },
  { id: 5, image: productionHarvest, text: "Cosecha manual en nuestros viñedos orgánicos." },
  { id: 6, image: productionWater, text: "Agua de manantial, pureza desde el origen." }
];

const AboutPage: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev === productionItems.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev === 0 ? productionItems.length - 1 : prev - 1));
  };

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  // Reset animation lock
  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  return (
    <div className={styles['about-container']}>

      {/* 1. HEADER & VIDEO */}
      <header className={styles['about-header']}>
        <h1>Nosotros</h1>
        <p className={styles['about-subtitle']}>Una historia de tradición, campo y familia.</p>
      </header>

      <div className={styles['video-responsive']}>
        <iframe
          src="https://www.youtube.com/embed/586cbhkJixs?autoplay=1&mute=1&controls=0&loop=1&playlist=586cbhkJixs&modestbranding=1&rel=0&playsinline=1&vq=hd1080"
          title="Familia García Vidal - VIDEO INSTITUCIONAL"
          frameBorder="0"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>

      {/* 2. SECCIÓN: TRAZABILIDAD (CAMPO A MESA) */}
      <section className={`${styles['about-section']} ${styles['trace-section']}`}>
        <h2>Desde el campo hasta tu mesa</h2>
        <p className={styles['lead-text']}>
          Estamos presentes en cada etapa del proceso productivo, asegurando trazabilidad en la cadena.
          Nos basamos en un sistema integrado, de punta a punta, desde nuestras tierras donde se origina todo,
          hasta la entrega de nuestras carnes asadas en manos de nuestros clientes.
        </p>

        {/* CARRUSEL DE PRODUCCIÓN (Reemplaza a los íconos) */}
        <div className={styles['carousel-wrapper']}>
          <div className={styles['carousel-content']}>

            <div className={styles['carousel-image-container']}>
              <img
                src={productionItems[currentIndex].image}
                alt={`Producción ${productionItems[currentIndex].id}`}
                className={styles['carousel-image']}
              />
              <div className={styles['image-overlay']}></div>
            </div>

            <div className={styles['carousel-text-container']}>
              {/* <div className={styles['slide-number']}>0{productionItems[currentIndex].id}</div>  Opcional mostrar número */}
              <h2 className={styles['slide-text']}>
                "{productionItems[currentIndex].text}"
              </h2>
            </div>

            <button className={`${styles['nav-btn']} ${styles['prev-btn']}`} onClick={prevSlide}>
              <FaChevronLeft />
            </button>
            <button className={`${styles['nav-btn']} ${styles['next-btn']}`} onClick={nextSlide}>
              <FaChevronRight />
            </button>
          </div>

          <div className={styles['indicators']}>
            {productionItems.map((_, index) => (
              <button
                key={index}
                className={`${styles['indicator']} ${index === currentIndex ? styles['active'] : ''}`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Ir a item ${index + 1}`}
              />
            ))}
          </div>
        </div>


      </section>

      {/* 3. SECCIÓN: EMPRESA FAMILIAR */}
      <section className={`${styles['about-section']} ${styles['family-section']}`}>
        <div className={styles['family-content']}>
          <h2>Una Empresa Familiar</h2>
          <p className={styles['family-tagline']}>Agropecuaria y Gastronómica</p>
          <p>
            Trabajamos día a día para asegurarte productos de primera calidad.
            Tenemos como principal objetivo brindar a las familias comida casera
            ultracongelada o fría, para que regeneren de manera rápida y sencilla en su casa.
          </p>

          <Link to="/productos" className={styles['btn-about-cta']}>
            Ver nuestros productos
          </Link>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;
