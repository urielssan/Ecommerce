import React, { useState, useEffect, useRef } from 'react';
import { Product, FamilyMember } from '../../types';
import { FaTruck, FaStore, FaBolt, FaSearch, FaBarcode, FaTimes, FaMoneyBillWave, FaCalendarAlt, FaClock, FaComment } from 'react-icons/fa';
import styles from './styles/OrderTaker.module.css';
import PrimaryButton from '../PrimaryButton';

interface OrderTakerProps {
    onOrderCreated?: () => void;
}

type OrderType = 'immediate' | 'pickup' | 'delivery' | 'selection';

const OrderTaker: React.FC<OrderTakerProps> = ({ onOrderCreated }) => {
    // Flow State
    const [view, setView] = useState<OrderType>('selection');
    const [step, setStep] = useState<'type-select' | 'family-check' | 'order-pad'>('type-select');

    // Data State
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
    const [customer, setCustomer] = useState<FamilyMember | null>(null);

    // Order Details State
    const [source, setSource] = useState('Local');
    const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
    const [orderTime, setOrderTime] = useState(new Date().toTimeString().split(' ')[0].slice(0, 5));
    const [paymentMethod, setPaymentMethod] = useState('Efectivo');
    const [observations, setObservations] = useState('');

    // Customer Form State (Editable)
    const [custDni, setCustDni] = useState('');
    const [custName, setCustName] = useState('');
    const [custPhone, setCustPhone] = useState('');
    const [custAddress, setCustAddress] = useState('');


    // Search & Scan State
    const [scanInput, setScanInput] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);

    // UI State
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [dniSearch, setDniSearch] = useState('');

    const scanInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Load products
        const fetchProducts = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/productos`);
                const data = await res.json();
                setProducts(data);
            } catch (err) {
                console.error("Error loading products", err);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        // Auto-focus scanner input when entering order pad
        if (step === 'order-pad' && scanInputRef.current) {
            scanInputRef.current.focus();
        }
    }, [step]);

    // Filter products in real-time
    useEffect(() => {
        if (!scanInput || scanInput.length < 2) {
            setSearchResults([]);
            return;
        }

        const lowerInput = scanInput.toLowerCase();
        // Filter by ID match (exact start) or Name match (includes)
        const matches = products.filter(p =>
            p.NombresProductos.toLowerCase().includes(lowerInput) ||
            p.idProductos.toString().startsWith(lowerInput)
        ).slice(0, 8); // Limit to 8 results

        setSearchResults(matches);
    }, [scanInput, products]);

    const handleStartOrder = (type: OrderType) => {
        setView(type);
        setStep('family-check');

        // Reset valid defaults
        setCart([]);
        setCustomer(null);
        setCustDni('');
        setCustName('');
        setCustPhone('');
        setCustAddress('');
        setScanInput('');
        setMessage(null);
        setObservations('');
        setSource('Local');

        // Set default date/time
        const now = new Date();
        setOrderDate(now.toISOString().split('T')[0]);
        setOrderTime(now.toTimeString().split(' ')[0].slice(0, 5));
    };

    const handleFamilySearch = async () => {
        if (!dniSearch) return;
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/miembros/${dniSearch}`);
            if (res.ok) {
                const data = await res.json();
                setCustomer(data);
                setCustDni(data.dni || '');
                setCustName(`${data.nombre} ${data.apellido}`);
                setCustPhone(data.telefono || '');
                setCustAddress(data.direccion || '');
                setStep('order-pad');
            } else {
                alert('Miembro no encontrado. Verifique el DNI o continúe sin registrar.');
            }
        } catch (err) {
            alert('Error al buscar miembro');
        }
    };

    const skipFamilyCheck = () => {
        setCustomer(null);
        setCustDni('');
        setCustName('');
        setCustPhone('');
        setCustAddress('');
        setStep('order-pad');
    };

    const handleScanKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            // Try to find exact match by ID first, then add the first search result if any
            const exactIdMatch = products.find(p => p.idProductos.toString() === scanInput);

            if (exactIdMatch) {
                addToCart(exactIdMatch);
                setScanInput('');
            } else if (searchResults.length > 0) {
                addToCart(searchResults[0]);
                setScanInput('');
            }
        }
    };

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.idProductos === product.idProductos);
            if (existing) {
                return prev.map(item =>
                    item.product.idProductos === product.idProductos
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
        setMessage({ type: 'success', text: `Agregado: ${product.NombresProductos}` });
        setTimeout(() => setMessage(null), 1500);

        // Keep focus
        if (scanInputRef.current) scanInputRef.current.focus();
    };

    const removeFromCart = (id: number) => {
        setCart(prev => prev.filter(item => item.product.idProductos !== id));
    };

    const calculateTotal = () => {
        return cart.reduce((acc, item) => acc + (item.product.Precio * item.quantity), 0);
    };

    const finalizeOrder = async () => {
        if (cart.length === 0) {
            alert("El carrito está vacío");
            return;
        }
        setLoading(true);

        if ((view === 'pickup' || view === 'delivery') && (!custName || !custPhone || (view === 'delivery' && !custAddress))) {
            alert("Por favor complete los datos obligatorios del cliente (Nombre y Teléfono son requeridos siempre, Dirección para envíos).");
            setLoading(false);
            return;
        }

        const orderData = {
            cartItems: cart.map(item => ({ ...item.product, quantity: item.quantity })),
            dni: custDni || customer?.dni || null,
            nombre: custName || (customer ? `${customer.nombre} ${customer.apellido}` : 'Cliente Mostrador'),
            email: customer?.email || '',
            telefono: custPhone || customer?.telefono || '',
            direccion: custAddress || customer?.direccion || '',
            metodoPago: paymentMethod,
            montoTotal: calculateTotal(),
            tipoPedido: view === 'immediate' ? 'Inmediato' : (view === 'pickup' ? 'Retiro' : 'Envio'),
            envioDomicilio: view === 'delivery' ? 'Si' : 'No',
            costoEnvio: 0,
            observaciones: observations,
            fechaEntrega: orderDate,
            horarioEntrega: orderTime,
            // Mapping source to 'Medio'
            medio: source
        };

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (res.ok) {
                alert('Pedido creado con éxito!');
                setStep('type-select');
                setView('selection');
                if (onOrderCreated) onOrderCreated();
            } else {
                alert('Error al crear pedido');
            }
        } catch (err) {
            console.error(err);
            alert('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    // --- RENDERERS ---

    if (step === 'type-select') {
        return (
            <div className={styles['order-taker-menu']}>
                <h3>Tomar Pedido - Seleccionar Tipo</h3>
                <div className={styles['order-type-buttons']}>
                    <button onClick={() => handleStartOrder('immediate')} className={`${styles['type-btn']} ${styles.immediate}`}>
                        <FaBolt /> Pedido Inmediato
                    </button>
                    <button onClick={() => handleStartOrder('pickup')} className={`${styles['type-btn']} ${styles.pickup}`}>
                        <FaStore /> Pedido a Retirar
                    </button>
                    <button onClick={() => handleStartOrder('delivery')} className={`${styles['type-btn']} ${styles.delivery}`}>
                        <FaTruck /> Pedido con Envío
                    </button>
                </div>
            </div>
        );
    }

    if (step === 'family-check') {
        return (
            <div className={styles['family-check-container']}>
                <h3>¿Es miembro de la familia (Cliente Fiel)?</h3>
                <p className={styles['step-info']}>Paso 1 de 2: Identificación</p>
                <div className={styles['search-box']}>
                    <input
                        type="text"
                        placeholder="Ingrese DNI del cliente"
                        value={dniSearch}
                        onChange={(e) => setDniSearch(e.target.value)}
                    />
                    <button onClick={handleFamilySearch} disabled={!dniSearch} className={styles['btn-yes']}>
                        SÍ (Buscar)
                    </button>
                </div>
                <button onClick={skipFamilyCheck} className={styles['btn-no']}>
                    NO (Cliente Casual)
                </button>
                <button onClick={() => setStep('type-select')} className={styles['btn-cancel']}>
                    Cancelar
                </button>
            </div>
        );
    }

    return (
        <div className={styles['pos-container']}>
            <header className={styles['pos-header']}>
                <button onClick={() => setStep('type-select')} className={styles['back-btn']}>← Volver</button>
                <div className={styles['header-info']}>
                    {customer ? (
                        <span className={styles['badge-member']}>Familia: {customer.nombre} {customer.apellido}</span>
                    ) : (
                        <span className={styles['badge-guest']}>Cliente Casual</span>
                    )}
                    <span className={styles['order-type-badge']}>{view.toUpperCase()}</span>
                </div>
            </header>

            <div className={styles['pos-layout']}>
                {/* Customer Details Form (Only for Pickup & Delivery) */}
                {(view === 'pickup' || view === 'delivery') && (
                    <div className={styles['customer-form-section']}>
                        <h4>Datos del Cliente {customer ? '(Fiel)' : '(Nuevo/Casual)'}</h4>
                        <div className={styles['customer-form-grid']}>
                            <div className={styles['form-group']}>
                                <label>DNI</label>
                                <input
                                    type="text"
                                    value={custDni}
                                    onChange={e => setCustDni(e.target.value)}
                                    placeholder="Opcional"
                                />
                            </div>
                            <div className={styles['form-group']}>
                                <label>Nombre Completo *</label>
                                <input
                                    type="text"
                                    value={custName}
                                    onChange={e => setCustName(e.target.value)}
                                    placeholder="Nombre y Apellido"
                                    required
                                />
                            </div>
                            <div className={styles['form-group']}>
                                <label>Teléfono *</label>
                                <input
                                    type="text"
                                    value={custPhone}
                                    onChange={e => setCustPhone(e.target.value)}
                                    placeholder="Whatsapp/Tel"
                                    required
                                />
                            </div>
                            <div className={`${styles['form-group']} ${styles['full-width']}`}>
                                <label>Dirección {view === 'delivery' ? '*' : '(Opcional)'}</label>
                                <input
                                    type="text"
                                    value={custAddress}
                                    onChange={e => setCustAddress(e.target.value)}
                                    placeholder="Dirección completa"
                                    required={view === 'delivery'}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Order Details Form */}
                <div className={styles['order-details-bar']}>
                    <div className={styles['form-row']}>
                        <label>Origen (Canal):</label>
                        <select value={source} onChange={(e) => setSource(e.target.value)}>
                            <option value="Local">Local</option>
                            <option value="Local Virtual">Local Virtual</option>
                            <option value="Manychat">Manychat</option>
                            <option value="Instagram">Instagram</option>
                            <option value="Whatsapp">Whatsapp</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>

                    <div className={styles['form-row']}>
                        <label>{view === 'delivery' ? 'Entrega:' : 'Retiro:'}</label>
                        <div className={styles['date-time-inputs']}>
                            <input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
                            <input type="time" value={orderTime} onChange={(e) => setOrderTime(e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className={styles['scan-section']}>
                    <div className={styles['scanner-input-wrapper']}>
                        <FaSearch className={styles['scanner-icon']} />
                        <input
                            ref={scanInputRef}
                            type="text"
                            value={scanInput}
                            onChange={(e) => setScanInput(e.target.value)}
                            onKeyDown={handleScanKeyDown}
                            placeholder="Escanear o buscar producto..."
                            className={styles['scanner-input']}
                            autoComplete="off"
                        />
                        {/* Auto-search Results Dropdown */}
                        {searchResults.length > 0 && (
                            <div className={styles['search-dropdown']}>
                                {searchResults.map(p => (
                                    <div
                                        key={p.idProductos}
                                        className={styles['search-item']}
                                        onClick={() => { addToCart(p); setScanInput(''); }}
                                    >
                                        <span className={styles['search-item-name']}>{p.NombresProductos}</span>
                                        <span className={styles['search-item-price']}>${p.Precio}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {message && <div className={`${styles['scan-message']} ${styles[message.type]}`}>{message.text}</div>}
                </div>

                <div className={styles['cart-list']}>
                    <table>
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Cant</th>
                                <th>Precio</th>
                                <th>Subtotal</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.map((item, idx) => (
                                <tr key={idx}>
                                    <td>{item.product.NombresProductos}</td>
                                    <td>
                                        <div className={styles['qty-controls']}>
                                            <button onClick={() => {
                                                if (item.quantity > 1) {
                                                    setCart(prev => prev.map(i => i.product.idProductos === item.product.idProductos ? { ...i, quantity: i.quantity - 1 } : i))
                                                } else {
                                                    removeFromCart(item.product.idProductos);
                                                }
                                            }}>-</button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => {
                                                setCart(prev => prev.map(i => i.product.idProductos === item.product.idProductos ? { ...i, quantity: i.quantity + 1 } : i))
                                            }}>+</button>
                                        </div>
                                    </td>
                                    <td>${item.product.Precio}</td>
                                    <td>${item.product.Precio * item.quantity}</td>
                                    <td>
                                        <button onClick={() => removeFromCart(item.product.idProductos)} className={styles['remove-btn']}><FaTimes /></button>
                                    </td>
                                </tr>
                            ))}
                            {cart.length === 0 && (
                                <tr>
                                    <td colSpan={5} className={styles['empty-cart-msg']}>
                                        Busca o escanea productos para agregar al pedido
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className={styles['pos-footer']}>
                    <div className={styles['footer-row']}>
                        <div className={styles['payment-select']}>
                            <label><FaMoneyBillWave /> Pago:</label>
                            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                                <option value="Efectivo">Efectivo</option>
                                <option value="MercadoPago">MercadoPago</option>
                                <option value="Transferencia">Transferencia</option>
                                <option value="Debito">Débito</option>
                                <option value="Credito">Crédito</option>
                            </select>
                        </div>
                        <div className={styles['obs-input']}>
                            <label><FaComment /> Obs:</label>
                            <input
                                type="text"
                                value={observations}
                                onChange={(e) => setObservations(e.target.value)}
                                placeholder="Notas del pedido..."
                            />
                        </div>
                    </div>

                    <div className={styles['footer-actions']}>
                        <div className={styles['total-display']}>
                            Total: ${calculateTotal().toFixed(2)}
                        </div>
                        <PrimaryButton onClick={finalizeOrder} className={styles['finalize-btn']} disabled={loading || cart.length === 0}>
                            {loading ? 'Procesando...' : 'CONFIRMAR PEDIDO'}
                        </PrimaryButton>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTaker;
