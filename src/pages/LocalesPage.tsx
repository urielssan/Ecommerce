import React from 'react';
import styles from './styles/LocalesPage.module.css';
import { FaClock, FaMapMarkerAlt, FaWhatsapp, FaPhone } from 'react-icons/fa';

const LocalesPage: React.FC = () => {
  // Datos del local (Si abres más sucursales, solo copias este bloque)
  const locales = [
    {
      id: 1,
      nombre: "Barrio Martin",
      direccion: "3 de Febrero 380, Rosario",
      horario: "Lunes a Sábados 8 - 22 hrs",
      whatsapp: "3413080099", // Número limpio para el link
      whatsappDisplay: "341 308-0099",
      telefono: "3417690034",
      telefonoDisplay: "341 769-0034",
      // Tu iframe del mapa
      mapaUrl: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d6695.742384819482!2d-60.62953000000001!3d-32.95441000000001!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95b7ab021f663b17%3A0x4924ba37de0d5f09!2sFamilia%20Garcia%20Vidal!5e0!3m2!1sen!2sar!4v1764603793097!5m2!1sen!2sar"
    }
  ];

  return (
    <div className={styles['locales-container']}>
      <header className={styles['locales-header']}>
        <h1>Nuestros Locales</h1>
        <p>Vení a conocer la calidad de siempre, cerca de tu casa.</p>
      </header>

      <div className={styles['locales-list']}>
        {locales.map((local) => (
          <div key={local.id} className={styles['local-card']}>

            {/* COLUMNA IZQUIERDA: INFO */}
            <div className={styles['local-info']}>
              <h2>{local.nombre}</h2>

              <div className={`${styles['info-item']} ${styles.address}`}>
                <span className={styles.icon}><FaMapMarkerAlt /></span>
                <p>{local.direccion}</p>
              </div>

              <div className={`${styles['info-item']} ${styles.hours}`}>
                <span className={styles.icon}><FaClock /></span>
                <p>{local.horario}</p>
              </div>

              <div className={styles['contact-buttons']}>
                {/* Botón WhatsApp */}
                <a
                  href={`https://wa.me/549${local.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles['btn-contact']} ${styles['btn-whatsapp']}`}
                >
                  <FaWhatsapp style={{ marginRight: '5px' }} /> WhatsApp: {local.whatsappDisplay}
                </a>

                {/* Botón Llamada */}
                <a
                  href={`tel:${local.telefono}`}
                  className={`${styles['btn-contact']} ${styles['btn-phone']}`}
                >
                  <FaPhone style={{ marginRight: '5px' }} /> Llamadas: {local.telefonoDisplay}
                </a>
              </div>
            </div>

            {/* COLUMNA DERECHA: MAPA */}
            <div className={styles['local-map']}>
              <iframe
                src={local.mapaUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Mapa ${local.nombre}`}
              ></iframe>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default LocalesPage;
