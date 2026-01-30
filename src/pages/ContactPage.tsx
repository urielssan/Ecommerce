import React, { useState } from 'react';
import styles from './styles/ContactPage.module.css';
import { FaMapMarkerAlt, FaEnvelope, FaWhatsapp, FaInstagram, FaFacebook } from 'react-icons/fa';

const ContactPage: React.FC = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        mensaje: ''
    });
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');

        try {
            const response = await fetch('http://localhost:5000/api/contacto', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setStatus('success');
                setFormData({ nombre: '', email: '', telefono: '', mensaje: '' }); // Limpiar form
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    return (
        <div className={styles['contact-container']}>
            <header className={styles['contact-header']}>
                <h1>Contacto</h1>
                <p>Estamos para asesorarte. Escribinos y te responderemos a la brevedad.</p>
            </header>

            <div className={styles['contact-grid']}>
                {/* COLUMNA IZQUIERDA: DATOS */}
                <div className={styles['contact-info-card']}>
                    <h3>Información de Contacto</h3>
                    <p className={styles['info-intro']}>
                        Si preferís una atención inmediata, podés llamarnos o visitarnos en nuestros locales.
                    </p>

                    <div className={styles['info-item']}>
                        <span className={styles.icon}><FaMapMarkerAlt /></span>
                        <div>
                            <strong>Administración / Local Principal</strong>
                            <p>3 de Febrero 380, Rosario</p>
                        </div>
                    </div>

                    <div className={styles['info-item']}>
                        <span className={styles.icon}><FaEnvelope /></span>
                        <div>
                            <strong>Email de Compras</strong>
                            <p>compras@garciavidal.com</p>
                        </div>
                    </div>

                    <div className={styles['info-item']}>
                        <span className={styles.icon}><FaWhatsapp /></span>
                        <div>
                            <strong>WhatsApp</strong>
                            <p>341 308-0099</p>
                        </div>
                    </div>

                    <div className={styles['social-links-contact']}>
                        <h4>Seguinos</h4>
                        <a href="https://instagram.com/familiagarciavidal" target="_blank" rel="noreferrer"><FaInstagram style={{ marginRight: '5px' }} /> Instagram</a>
                        <a href="https://facebook.com" target="_blank" rel="noreferrer"><FaFacebook style={{ marginRight: '5px' }} /> Facebook</a>
                    </div>
                </div>

                {/* COLUMNA DERECHA: FORMULARIO */}
                <div className={styles['contact-form-wrapper']}>
                    <form onSubmit={handleSubmit} className={styles['contact-form']}>
                        <h3>Envianos un mensaje</h3>

                        <div className={styles['form-group']}>
                            <label>Nombre Completo</label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                                placeholder="Juan Pérez"
                            />
                        </div>

                        <div className={styles['form-grid-2']}>
                            <div className={styles['form-group']}>
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="juan@ejemplo.com"
                                />
                            </div>
                            <div className={styles['form-group']}>
                                <label>Teléfono</label>
                                <input
                                    type="tel"
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                    placeholder="341..."
                                />
                            </div>
                        </div>

                        <div className={styles['form-group']}>
                            <label>Mensaje</label>
                            <textarea
                                name="mensaje"
                                value={formData.mensaje}
                                onChange={handleChange}
                                required
                                rows={5}
                                placeholder="Hola, quisiera consultar sobre..."
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            className={styles['btn-submit']}
                            disabled={status === 'sending' || status === 'success'}
                        >
                            {status === 'sending' ? 'Enviando...' :
                                status === 'success' ? '¡Mensaje Enviado!' :
                                    'ENVIAR MENSAJE'}
                        </button>

                        {status === 'success' && (
                            <p className={styles['msg-success']}>¡Gracias! Hemos recibido tu mensaje correctamente.</p>
                        )}
                        {status === 'error' && (
                            <p className={styles['msg-error']}>Hubo un error al enviar. Por favor intentá por WhatsApp.</p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
