
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { SHIPPING_ZONES, TIME_RANGES } from '../data/shipping';
import { useNavigate } from 'react-router-dom';
import styles from './styles/CheckoutPage.module.css';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';
import { getGoogleDriveDirectLink } from '../utils';

const CheckoutPage: React.FC = () => {
    const { cart, clearCart, removeFromCart, decreaseQuantity, addToCart } = useCart();
    const navigate = useNavigate();

    // Form States
    const [formData, setFormData] = useState({
        dni: '',
        nombre: '', // Cliente
        direccion: '',
        telefono: '',
        email: '',
        fechaNacimiento: '',
        sexo: '',
        fechaEntrega: '',
        horarioEntrega: '',
        metodoPago: 'Efectivo',
        observaciones: '',
        banco: '',
        envioId: ''
    });

    const [shippingCost, setShippingCost] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const subtotal = cart.reduce((sum, item) => sum + (item.Precio * item.quantity), 0);

    // Calculate shipping cost based on selection and subtotal rules
    useEffect(() => {
        if (!formData.envioId) {
            setShippingCost(0);
            return;
        }
        const zone = SHIPPING_ZONES.find(z => z.id === formData.envioId);
        if (zone) {
            if (subtotal >= zone.minPurchaseForFree) {
                setShippingCost(0);
            } else {
                setShippingCost(zone.cost);
            }
        }
    }, [formData.envioId, subtotal]);

    const total = subtotal + shippingCost;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        if (cart.length === 0) {
            setError('El carrito está vacío');
            setIsSubmitting(false);
            return;
        }

        const orderData = {
            ...formData,
            cartItems: cart,
            montoTotal: total,
            costoEnvio: shippingCost,
            envioDomicilio: 'Si'
        };

        try {
            // 1. Crear el pedido en nuestra DB primero (Estado: Pendiente/No Pagado)
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) throw new Error('Error al procesar el pedido');

            // 2. Si es Mercado Pago, crear preferencia y redirigir
            if (formData.metodoPago === 'MercadoPago') {
                const mpResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/create_preference`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items: cart })
                });

                if (!mpResponse.ok) {
                    const errorData = await mpResponse.json();
                    throw new Error(errorData.error || 'Error al conectar con Mercado Pago');
                }

                const mpData = await mpResponse.json();
                if (mpData.init_point) {
                    window.location.href = mpData.init_point; // Redirigir
                    return; // Detenemos ejecución aquí
                } else {
                    throw new Error('No se pudo generar el link de pago');
                }
            }

            // 3. Flujo normal (Efectivo/Transferencia)
            clearCart();
            alert('¡Pedido realizado con éxito!');
            navigate('/');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error desconocido');
        } finally {
            if (formData.metodoPago !== 'MercadoPago') {
                setIsSubmitting(false);
            }
        }
    };

    if (cart.length === 0) {
        return (
            <div className={styles['checkout-container']} style={{ textAlign: 'center', padding: '5rem' }}>
                <h2>Tu carrito está vacío</h2>
                <button onClick={() => navigate('/productos')} className={styles['checkout-btn']} style={{ width: '200px' }}>Ver Productos</button>
            </div>
        );
    }

    return (
        <div className={styles['checkout-container']}>
            <h1>Finalizar Compra</h1>

            <div className={styles['checkout-grid']}>
                <form className={styles['checkout-form']} onSubmit={handleSubmit}>
                    {error && <div className={styles['error-msg']}>{error}</div>}

                    <div className={styles['form-section']}>
                        <h3>Datos Personales</h3>
                        <div className={styles['form-row']}>
                            <div className={styles['form-group']}>
                                <label>DNI</label>
                                <input type="text" name="dni" required onChange={handleInputChange} />
                            </div>
                            <div className={styles['form-group']}>
                                <label>Nombre Completo</label>
                                <input type="text" name="nombre" required onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className={styles['form-row']}>
                            <div className={styles['form-group']}>
                                <label>Email</label>
                                <input type="email" name="email" required onChange={handleInputChange} />
                            </div>
                            <div className={styles['form-group']}>
                                <label>Teléfono</label>
                                <input type="tel" name="telefono" required onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className={styles['form-row']}>
                            <div className={styles['form-group']}>
                                <label>Fecha de Nacimiento</label>
                                <input type="date" name="fechaNacimiento" required onChange={handleInputChange} />
                            </div>
                            <div className={styles['form-group']}>
                                <label>Sexo</label>
                                <select name="sexo" required onChange={handleInputChange}>
                                    <option value="">Seleccionar...</option>
                                    <option value="Femenino">Femenino</option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className={styles['form-section']}>
                        <h3>Envío</h3>
                        <div className={styles['form-group']}>
                            <label>Dirección de Entrega</label>
                            <input type="text" name="direccion" required onChange={handleInputChange} placeholder="Calle, número, piso, dpto" />
                        </div>
                        <div className={styles['form-group']}>
                            <label>Zona de Envío</label>
                            <select name="envioId" required onChange={handleInputChange}>
                                <option value="">Seleccionar Zona...</option>
                                {SHIPPING_ZONES.map(zone => (
                                    <option key={zone.id} value={zone.id}>
                                        {zone.name} - ${zone.cost} (Gratis superando ${zone.minPurchaseForFree})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className={styles['form-row']}>
                            <div className={styles['form-group']}>
                                <label>Fecha de Entrega</label>
                                <input type="date" name="fechaEntrega" required onChange={handleInputChange} />
                            </div>
                            <div className={styles['form-group']}>
                                <label>Horario de Entrega</label>
                                <select name="horarioEntrega" required onChange={handleInputChange}>
                                    <option value="">Seleccionar Rango...</option>
                                    {TIME_RANGES.map(range => (
                                        <option key={range} value={range}>{range}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className={styles['form-section']}>
                        <h3>Pago</h3>
                        <div className={styles['form-group']}>
                            <label>Método de Pago</label>
                            <select name="metodoPago" required onChange={handleInputChange}>
                                <option value="Efectivo">Efectivo</option>
                                <option value="Transferencia">Transferencia Bancaria</option>
                                <option value="Tarjeta">Tarjeta de Crédito/Débito</option>
                                <option value="MercadoPago">Mercado Pago</option>
                            </select>
                        </div>
                        {formData.metodoPago === 'Transferencia' && (
                            <div className={styles['form-group']}>
                                <label>Banco (si aplica)</label>
                                <input type="text" name="banco" onChange={handleInputChange} />
                            </div>
                        )}
                        {formData.metodoPago === 'MercadoPago' && (
                            <div className={styles['info-box-mp']} style={{ padding: '10px', background: '#e1f5fe', marginBottom: '15px', color: '#01579b', borderRadius: '4px', fontSize: '14px' }}>
                                Serás redirigido a Mercado Pago para completar tu pago de forma segura.
                            </div>
                        )}
                        <div className={styles['form-group']}>
                            <label>Observaciones</label>
                            <textarea name="observaciones" onChange={handleInputChange} rows={3}></textarea>
                        </div>
                    </div>

                    <button type="submit" className={styles['checkout-btn']} disabled={isSubmitting}>
                        {isSubmitting ? 'Procesando...' : 'Confirmar Pedido'}
                    </button>
                </form>

                <div className={styles['order-summary']}>
                    <h3>Resumen del Pedido</h3>
                    <div className={styles['summary-items']}>
                        {cart.map((item, idx) => (
                            <div key={`${item.idProductos}-${idx}`} className={styles['summary-item']}>
                                {item.UrlImagen ? (
                                    <img src={getGoogleDriveDirectLink(item.UrlImagen)} alt={item.NombresProductos} className={styles['summary-img']} />
                                ) : (
                                    <div className={styles['summary-img-placeholder']}>{item.NombresProductos.charAt(0)}</div>
                                )}
                                <div className={styles['quantity-controls']}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (item.quantity === 1) {
                                                if (window.confirm('¿Estás seguro que deseas eliminar este producto?')) {
                                                    decreaseQuantity(item.idProductos);
                                                }
                                            } else {
                                                decreaseQuantity(item.idProductos);
                                            }
                                        }}
                                        className={styles['qty-btn']}
                                    >
                                        <FaMinus size={10} />
                                    </button>
                                    <span className={styles['qty-val']}>{item.quantity}</span>
                                    <button
                                        type="button"
                                        onClick={() => addToCart(item)}
                                        className={styles['qty-btn']}
                                    >
                                        <FaPlus size={10} />
                                    </button>
                                </div>
                                <div>{item.NombresProductos}</div>
                                <span>${(item.Precio * item.quantity).toLocaleString()}</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (window.confirm('¿Estás seguro que deseas eliminar este producto?')) {
                                            removeFromCart(item.idProductos);
                                        }
                                    }}
                                    className={styles['delete-item-btn']}
                                    title="Eliminar producto"
                                >
                                    <FaTrash size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className={styles['summary-row']}>
                        <span>Subtotal:</span>
                        <span>${subtotal.toLocaleString()}</span>
                    </div>
                    <div className={styles['summary-row']}>
                        <span>Envío:</span>
                        <span>${shippingCost.toLocaleString()}</span>
                    </div>
                    <div className={styles['summary-total']}>
                        <span>Total:</span>
                        <span>${total.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
