import React from 'react';
import styles from './styles/ShippingPage.module.css';
import { FaClock, FaMapMarkerAlt } from 'react-icons/fa';

const ShippingPage: React.FC = () => {
  return (
    <div className={styles['shipping-container']}>
      <header className={styles['shipping-header']}>
        <h1>Envío a Domicilio</h1>
        <p className={styles.subtitle}>¡Opciones de envío a medida!</p>
      </header>

      {/* SECCIÓN 1: COSTOS */}
      <section className={styles['shipping-options-grid']}>
        {/* Opción 1 */}
        <div className={`${styles['shipping-card']} ${styles['option-free']}`}>
          <h2>ENVÍO BONIFICADO (GRATIS)</h2>
          <p className={styles['card-subtitle']}>Al superar el monto mínimo de compra según tu zona:</p>
          <ul>
            <li><strong>$25.000</strong> - Macrocentro Rosario <small>(dentro de Avellaneda, 27 de Febrero y el río)</small></li>
            <li><strong>$30.000</strong> - Rosario <small>(Zona Sur, Zona Oeste y Zona Norte)</small></li>
            <li><strong>$35.000</strong> - Fisherton</li>
            <li><strong>$40.000</strong> - Funes o Baigorria</li>
            <li><strong>$45.000</strong> - Roldán</li>
          </ul>
        </div>

        {/* Opción 2 */}
        <div className={`${styles['shipping-card']} ${styles['option-paid']}`}>
          <h2>COSTO DE ENVÍO</h2>
          <p className={styles['card-subtitle']}>Valor del envío si NO superas el mínimo de compra:</p>
          <ul>
            <li><strong>$2.500</strong> - Macrocentro Rosario <small>(dentro de Avellaneda, 27 de Febrero y el río)</small></li>
            <li><strong>$3.500</strong> - Rosario <small>(Zona Sur, Zona Oeste y Zona Norte)</small></li>
            <li><strong>$4.500</strong> - Fisherton</li>
            <li><strong>$5.500</strong> - Funes o Baigorria</li>
            <li><strong>$6.500</strong> - Roldán</li>
          </ul>
        </div>
      </section>

      <hr className={styles.divider} />

      {/* SECCIÓN 2: HORARIOS */}
      <section className={styles['schedule-section']}>
        <h2>ELEGÍ TU DÍA Y RANGO HORARIO</h2>

        <div className={styles['time-ranges']}>
          <div className={styles['time-badge']}><FaClock className={styles.icon} style={{ marginRight: '8px' }} /> <strong>Mañana:</strong> 09:00 a 12:00</div>
          <div className={styles['time-badge']}><FaClock className={styles.icon} style={{ marginRight: '8px' }} /> <strong>Tarde:</strong> 12:00 a 15:00</div>
        </div>

        <div className={styles['zones-grid']}>
          <div className={styles['zone-item']}>
            <h3>1. Macrocentro</h3>
            <p className={styles['zone-desc']}>dentro de Avellaneda, 27 de Febrero y el río</p>
            <p><strong>Mañana:</strong> Lunes, Miércoles y Viernes</p>
            <p><strong>Tarde:</strong> Martes, Jueves y Sábado</p>
          </div>

          <div className={styles['zone-item']}>
            <h3>2. Fisherton, Funes y Roldán</h3>
            <p className={styles['zone-desc']}>Zona suburbana</p>
            <p><strong>Mañana:</strong> Martes, Jueves y Sábado</p>
            <p><strong>Tarde:</strong> Lunes, Miércoles y Viernes</p>
          </div>

          <div className={styles['zone-item']}>
            <h3>3. Zona Norte</h3>
            <p className={styles['zone-desc']}>dentro de Génova, Circunvalación y Baigorria</p>
            <p><strong>Mañana:</strong> Lunes</p>
            <p><strong>Tarde:</strong> Jueves</p>
          </div>

          <div className={styles['zone-item']}>
            <h3>4. Zona Oeste</h3>
            <p className={styles['zone-desc']}>después de Avellaneda, hasta Circunvalación</p>
            <p><strong>Mañana:</strong> Viernes</p>
            <p><strong>Tarde:</strong> Martes</p>
          </div>

          <div className={styles['zone-item']}>
            <h3>5. Zona Sur</h3>
            <p className={styles['zone-desc']}>dentro de Francia, 27 de Febrero y Circunvalación</p>
            <p><strong>Mañana:</strong> Miércoles</p>
            <p><strong>Tarde:</strong> Sábado</p>
          </div>
        </div>
      </section>

      {/* SECCIÓN 3: MAPA */}
      <section className={styles['map-section']}>
        <h2><FaMapMarkerAlt style={{ marginRight: '10px' }} /> Zona de Cobertura</h2>

        <div className={styles['map-search-container']}>
          <p style={{ marginBottom: '10px', color: '#666' }}>Ingresá tu dirección para ver en qué zona te encuentras:</p>
          <form onSubmit={(e) => {
            e.preventDefault();
            // Redirigir al Viewer de My Maps que tiene buscador y las zonas cargadas
            // My Maps no soporta query param directo de busqueda facilmente, asi que lo llevamos al mapa interactivo
            window.open('https://www.google.com/maps/d/viewer?mid=1Mbcc8_pPn2kttHMp0xKftzxGQrcTld8&ll=-32.95204576326164%2C-60.66699929999999&z=12', '_blank');
          }} className={styles['map-search-form']}>
            {/* Visualmente simulamos un buscador, pero el botón lleva al mapa interactivo completo */}
            <input
              type="text"
              placeholder="Ej: Av. Pellegrini 1500, Rosario"
              className={styles['map-search-input']}
            />
            <button type="submit" className={styles['map-search-btn']}>
              VER EN MAPA INTERACTIVO <FaMapMarkerAlt style={{ marginLeft: '5px' }} />
            </button>
          </form>
          <small style={{ display: 'block', marginTop: '5px', color: '#888' }}>* Te llevará al mapa oficial donde podrás usar la lupa para buscar tu dirección exacta sobre las zonas.</small>
        </div>

        <div className={styles['map-container']}>
          <iframe
            src="https://www.google.com/maps/d/embed?mid=1Mbcc8_pPn2kttHMp0xKftzxGQrcTld8&ehbc=2E312F"
            width="100%"
            height="480"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            title="Mapa de envios"
          ></iframe>
        </div>
      </section>
    </div>
  );
};

export default ShippingPage;
