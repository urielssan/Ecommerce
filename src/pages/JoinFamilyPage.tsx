import React from 'react';
import styles from './styles/JoinFamilyPage.module.css';
import { FaGift, FaTags, FaRocket, FaWpforms, FaHandPointRight } from 'react-icons/fa';
// Importamos la imagen (Asegúrate de que el nombre coincida)
import familyImage from '../assets/familia-header.png';

const JoinFamilyPage: React.FC = () => {
  // REEMPLAZA ESTA URL CON LA DE TU FORMULARIO DE GOOGLE O EL QUE USES
  const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfBAKB6wKK8rczigwbCHRaNH9S_1YbgtuZabVQKTdibhv5QXw/viewform";

  return (
    <div className={styles['join-container']}>

      {/* 1. HERO SECTION (Imagen y Título) */}
      <header className={styles['join-header']}>
        <div className={styles['image-wrapper']}>
          <img src={familyImage} alt="Forma parte de nuestra familia" />
        </div>
        <p className={styles['join-intro']}>
          Queremos invitarte a ser parte de <strong>nuestra comunidad exclusiva</strong>,
          donde cada cliente es valorado y recibe beneficios especiales.
        </p>
      </header>

      {/* 2. BENEFICIOS (Grilla de 3 columnas) */}
      <section className={styles['benefits-section']}>
        <h2>¿Por qué unirte a nuestra comunidad?</h2>
        <p className={styles['benefits-subtitle']}>
          Ser parte de nuestra familia no solo significa realizar compras,
          sino acceder a ventajas que transforman tu experiencia:
        </p>

        <div className={styles['benefits-grid']}>
          <div className={styles['benefit-card']}>
            <div className={styles['benefit-icon']}><FaGift /></div>
            <h3>Regalos especiales</h3>
            <p>Recibí obsequios sorpresa en fechas especiales y por tu fidelidad.</p>
          </div>

          <div className={styles['benefit-card']}>
            <div className={styles['benefit-icon']}><FaTags /></div>
            <h3>Promociones personalizadas</h3>
            <p>Recibí descuentos y promos adaptadas exclusivamente a tus gustos y necesidades.</p>
          </div>

          <div className={styles['benefit-card']}>
            <div className={styles['benefit-icon']}><FaRocket /></div>
            <h3>Lanzamientos anticipados</h3>
            <p>Sé el primero en enterarte de nuevos productos, eventos y novedades de la marca.</p>
          </div>
        </div>
      </section>

      {/* 3. CÓMO UNIRSE (CTA - Llamada a la acción) */}
      <section className={styles['how-to-join-section']}>
        <div className={styles['cta-box']}>
          <h2>¿Cómo unirte?</h2>
          <p>Es muy fácil y rápido. Solo tenés que completar el formulario y confirmar tu inscripción.</p>

          <a href={FORM_URL} target="_blank" rel="noopener noreferrer" className={styles['btn-join-form']}>
            <FaWpforms style={{ marginRight: '8px' }} /> COMPLETAR FORMULARIO FAMILIA GARCIA VIDAL
          </a>

          <p className={styles['cta-disclaimer']}>
            ¡Sumate ahora y empezá a disfrutar de todo lo que preparamos especialmente para vos!
          </p>
        </div>
      </section>

      {/* 4. SOCIAL FOOTER */}
      <footer className={styles['social-connect']}>
        <p>¡No te quedes afuera!</p>
        <p>
          <FaHandPointRight style={{ marginRight: '5px' }} /> Nuestras promociones, eventos y sorpresas las compartiremos en nuestras redes sociales
        </p>
        <a
          href="https://instagram.com/familiagarciavidal"
          target="_blank"
          rel="noopener noreferrer"
          className={styles['instagram-link']}
        >
          @familiagarciavidal
        </a>
      </footer>

    </div>
  );
};

export default JoinFamilyPage;
