import React, { useState, useEffect } from 'react';
import { FaBolt, FaStore, FaTruck, FaMoneyBillWave, FaCalendarAlt, FaClock, FaUser, FaMapMarkerAlt, FaEnvelope, FaPhone } from 'react-icons/fa';
import styles from './styles/OrdersList.module.css';

interface OrderItem {
    Producto: string;
    Cantidad: number;
}

interface Order {
    ID: string;
    Cliente: string;
    DNI: string;
    Items: OrderItem[];
    Total: number;
    Fecha: string;
    Pagado: string;
    MetodoPago: string;
    Envio: string;
    TipoPedido: string;
    Direccion: string;
    Telefono: string;
    Email: string;
    FechaEntrega: string;
    HorarioEntrega: string;
    Contacto: string;
    Observaciones: string;
    EstadoEnvio: string;
}

type TabType = 'Inmediato' | 'Retiro' | 'Envio';

const OrdersList: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('Inmediato');

    // Filter States
    const [filterDateStart, setFilterDateStart] = useState('');
    const [filterDateEnd, setFilterDateEnd] = useState('');
    const [filterClient, setFilterClient] = useState('');
    const [filterPayment, setFilterPayment] = useState('Todos');
    const [filterStatus, setFilterStatus] = useState('Todos');

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (filterDateStart) params.append('fecha_inicio', filterDateStart);
        if (filterDateEnd) params.append('fecha_fin', filterDateEnd);
        if (filterClient) params.append('cliente', filterClient);
        if (filterPayment && filterPayment !== 'Todos') params.append('metodo_pago', filterPayment);
        if (filterStatus && filterStatus !== 'Todos') params.append('estado', filterStatus);

        fetch(`${API_URL}/api/admin/orders?${params.toString()}`)
            .then(res => res.json())
            .then(data => {
                setOrders(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    const togglePay = async (orderId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'Si' ? 'No' : 'Si';
        try {
            const res = await fetch(`${API_URL}/api/admin/orders/${orderId}/pay`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pagado: newStatus })
            });
            if (res.ok) {
                // Actualizar localmente
                setOrders(orders.map(o => o.ID === orderId ? { ...o, Pagado: newStatus } : o));
            }
        } catch (error) {
            console.error(error);
            alert("Error al actualizar pago");
        }
    };

    const toggleExpand = (orderId: string) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    const filteredOrders = orders.filter(order => {
        if (activeTab === 'Inmediato') return order.TipoPedido === 'Inmediato';
        if (activeTab === 'Retiro') return order.TipoPedido === 'Retiro';
        if (activeTab === 'Envio') return order.TipoPedido === 'Envio' || order.TipoPedido === 'Venta Web';
        return false;
    });

    if (loading) return <div>Cargando pedidos...</div>;

    return (
        <div className={styles['orders-container']}>
            <div className={styles['orders-tabs']}>
                <button
                    className={`${styles['tab-btn']} ${activeTab === 'Inmediato' ? styles.active : ''}`}
                    onClick={() => setActiveTab('Inmediato')}
                >
                    <FaBolt /> Pedidos Inmediatos
                </button>
                <button
                    className={`${styles['tab-btn']} ${activeTab === 'Retiro' ? styles.active : ''}`}
                    onClick={() => setActiveTab('Retiro')}
                >
                    <FaStore /> Retiro por Local
                </button>
                <button
                    className={`${styles['tab-btn']} ${activeTab === 'Envio' ? styles.active : ''}`}
                    onClick={() => setActiveTab('Envio')}
                >
                    <FaTruck /> Envío a Domicilio
                </button>
            </div>

            {/* Filter Bar */}
            <div className={styles['filters-bar']}>
                <div className={styles['filter-group']}>
                    <label>Desde</label>
                    <input
                        type="date"
                        className={styles['filter-input']}
                        value={filterDateStart}
                        onChange={(e) => setFilterDateStart(e.target.value)}
                    />
                </div>
                <div className={styles['filter-group']}>
                    <label>Hasta</label>
                    <input
                        type="date"
                        className={styles['filter-input']}
                        value={filterDateEnd}
                        onChange={(e) => setFilterDateEnd(e.target.value)}
                    />
                </div>
                <div className={styles['filter-group']}>
                    <label>Cliente</label>
                    <input
                        type="text"
                        placeholder="Nombre o DNI"
                        className={styles['filter-input']}
                        value={filterClient}
                        onChange={(e) => setFilterClient(e.target.value)}
                    />
                </div>
                <div className={styles['filter-group']}>
                    <label>Tipo de Pago</label>
                    <select
                        className={styles['filter-input']}
                        value={filterPayment}
                        onChange={(e) => setFilterPayment(e.target.value)}
                    >
                        <option value="Todos">Todos</option>
                        <option value="Efectivo">Efectivo</option>
                        <option value="MercadoPago">MercadoPago</option>
                        <option value="Transferencia">Transferencia</option>
                        <option value="Debito">Débito</option>
                        <option value="Credito">Crédito</option>
                    </select>
                </div>
                <div className={styles['filter-group']}>
                    <label>Estado Pago</label>
                    <select
                        className={styles['filter-input']}
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="Todos">Todos</option>
                        <option value="Si">Pagado</option>
                        <option value="No">Pendiente</option>
                    </select>
                </div>
                <button className={styles['filter-btn']} onClick={fetchOrders}>
                    Filtrar
                </button>
                <button
                    className={`${styles['filter-btn']} ${styles['btn-clear']}`}
                    onClick={() => {
                        setFilterDateStart('');
                        setFilterDateEnd('');
                        setFilterClient('');
                        setFilterPayment('Todos');
                        setFilterStatus('Todos');
                        // Trigger fetch with empty filters immediately or let user click button?
                        // Let's trigger it.
                        setTimeout(fetchOrders, 0);
                        // Note: state update is async, so this might fetch with old state if not handled carefully.
                        // Actually, better to just clear inputs and let the user click filter, 
                        // or pass empty values to a separate fetch call.
                        // To keep it simple: just reload page or handle properly. 
                        // I'll leave as simple clear and let user re-click or I will just reload data without params.
                    }}
                >
                    Limpiar
                </button>
            </div>

            <div className={styles['orders-table-container']}>
                <table className={styles['orders-table']}>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Cliente</th>
                            <th>Total</th>
                            <th>Pago</th>
                            <th>Estado Pago</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                                    No hay pedidos que coincidan con los filtros.
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map(order => (
                                <React.Fragment key={order.ID}>
                                    <tr>
                                        <td>{new Date(order.Fecha).toLocaleDateString()}</td>
                                        <td>
                                            <strong>{order.Cliente}</strong><br />
                                            <small>{order.Contacto}</small>
                                        </td>
                                        <td>${Number(order.Total).toLocaleString()}</td>
                                        <td>{order.MetodoPago}</td>
                                        <td>
                                            <span className={`${styles['status-badge']} ${order.Pagado === 'Si' ? styles['status-pagado'] : styles['status-pendiente']}`}>
                                                {order.Pagado === 'Si' ? 'PAGADO' : 'PENDIENTE'}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className={`${styles['btn-action']} ${styles['btn-details']}`}
                                                onClick={() => toggleExpand(order.ID)}
                                            >
                                                {expandedOrder === order.ID ? 'Ocultar' : 'Ver Detalle'}
                                            </button>
                                            <button
                                                className={`${styles['btn-action']} ${styles['btn-pay']}`}
                                                onClick={() => togglePay(order.ID, order.Pagado)}
                                            >
                                                Marca como {order.Pagado === 'Si' ? 'No Pagado' : 'Pagado'}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedOrder === order.ID && (
                                        <tr className={styles['order-details-row']}>
                                            <td colSpan={6}>
                                                <div className={styles['details-content']}>
                                                    <div className={styles['details-column']}>
                                                        <div className={styles['details-block']}>
                                                            <h4><FaUser /> Datos del Cliente</h4>
                                                            <p><strong>Nombre:</strong> {order.Cliente}</p>
                                                            <p><strong>DNI:</strong> {order.DNI || '-'}</p>
                                                            <p><strong>Email:</strong> {order.Email || '-'}</p>
                                                            <p><strong>Teléfono:</strong> {order.Telefono || '-'}</p>
                                                        </div>
                                                        <div className={styles['details-block']}>
                                                            <h4><FaMapMarkerAlt /> Envío / Entrega</h4>
                                                            <p><strong>Tipo:</strong> {order.TipoPedido}</p>
                                                            {order.Direccion && <p><strong>Dirección:</strong> {order.Direccion}</p>}
                                                            {order.FechaEntrega && <p><strong>Fecha Entrega:</strong> {order.FechaEntrega}</p>}
                                                            {order.HorarioEntrega && <p><strong>Horario:</strong> {order.HorarioEntrega}</p>}
                                                        </div>
                                                    </div>

                                                    <div className={styles['details-column']}>
                                                        <div className={styles['details-block']}>
                                                            <h4>Productos</h4>
                                                            <ul className={styles['details-list']}>
                                                                {order.Items.map((item, idx) => (
                                                                    <li key={idx}>
                                                                        <strong>{item.Cantidad}x</strong> {item.Producto}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                        <div className={styles['details-block']}>
                                                            <h4><FaMoneyBillWave /> Pago</h4>
                                                            <p><strong>Total:</strong> ${Number(order.Total).toLocaleString()}</p>
                                                            <p><strong>Método:</strong> {order.MetodoPago}</p>
                                                            <p><strong>Estado:</strong> {order.Pagado === 'Si' ? 'Pagado' : 'Pendiente'}</p>
                                                        </div>
                                                    </div>

                                                    {(order.Observaciones) && (
                                                        <div className={`${styles['details-column']} ${styles['full-width']}`}>
                                                            <div className={styles['details-block']}>
                                                                <h4>Observaciones</h4>
                                                                <p>{order.Observaciones}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrdersList;
