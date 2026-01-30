import React, { useState, useEffect } from 'react';
import styles from './styles/StockManager.module.css';
import PrimaryButton from '../PrimaryButton';
import { useAuth } from '../../context/AuthContext';

interface Product {
    idProductos: number;
    NombresProductos: string;
}

interface StockReportItem {
    fecha: string;
    producto: string;
    stock_inicial: number;
    entradas_dia: number;
    salidas_dia: number;
    stock_final: number;
    salidas_futuras: number;
    stock_disponible: number;
    stock_minimo: number;
    semanas_stock: number;
}

const StockManager: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [report, setReport] = useState<StockReportItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });

    // Form State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default today
    const [movementType, setMovementType] = useState('entrada');
    const [reason, setReason] = useState('');

    const { user } = useAuth(); // Get current user

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${API_URL}/api/productos`);
            const data = await res.json();
            if (Array.isArray(data)) setProducts(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/stock/report`);
            if (res.ok) {
                const data = await res.json();
                setReport(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchReport();
    }, []);

    const filteredProducts = products.filter(p =>
        p.NombresProductos.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddStock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct || !quantity) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/stock/movimiento`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_producto: selectedProduct,
                    tipo: movementType,
                    cantidad: quantity,
                    motivo: reason || (movementType === 'entrada' ? 'Entrada Manual' : 'Salida Manual'),
                    usuario: user || 'Admin',
                    fecha: date
                })
            });

            if (res.ok) {
                setMsg({ type: 'success', text: 'Stock actualizado correctamente' });
                setQuantity('');
                setSearchTerm(''); // Clear search
                setReason('');
                setMovementType('entrada'); // Reset to default
                fetchReport();
            } else {
                setMsg({ type: 'error', text: 'Error al agregar stock' });
            }
        } catch (err) {
            setMsg({ type: 'error', text: 'Error de conexión' });
        } finally {
            setLoading(false);
            setTimeout(() => setMsg({ type: '', text: '' }), 3000);
        }
    };

    // Table State
    const [tableSearchTerm, setTableSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: keyof StockReportItem; direction: 'asc' | 'desc' } | null>(null);

    const handleSort = (key: keyof StockReportItem) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedReport = React.useMemo(() => {
        let sortableItems = [...report];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [report, sortConfig]);

    const filteredAndSortedReport = sortedReport.filter(item =>
        item.producto.toLowerCase().includes(tableSearchTerm.toLowerCase())
    );

    const getSortIndicator = (key: keyof StockReportItem) => {
        if (!sortConfig || sortConfig.key !== key) return null;
        return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
    };

    return (
        <div className={styles['stock-container']}>
            {/* ... (Previous Form Code Omitted for Brevity in this specific replace call replacement content,
              but in reality I need to keep the structure. Since I am replacing EVERYTHING from "return (" down to render,
              Wait, I should only replace the report section or insert the state before return and modify the report section.
              The file is small enough I can replace the logic area and the specific table area separately or carefully.)
             
              Actually, I will insert the state logic after line 38, and then replace the report-section div.
            */}
            <h3>Gestión de Stock</h3>

            {/* Input Form */}
            <div className={styles['stock-form']}>
                <h4>Entrada de Stock</h4>
                <form onSubmit={handleAddStock}>
                    {/* ... (Existing form fields, keep usage of existing state variables like searchTerm, etc) ... */}
                    <div className={styles['form-row']}>
                        <div className={styles['form-group']}>
                            <label>Tipo de Movimiento</label>
                            <select
                                value={movementType}
                                onChange={(e) => setMovementType(e.target.value)}
                                className={movementType === 'salida' ? styles['select-salida'] : styles['select-entrada']}
                            >
                                <option value="entrada">Entrada (+)</option>
                                <option value="salida">Salida (-)</option>
                            </select>
                        </div>

                        <div className={styles['form-group']}>
                            <label>Buscar Producto (Formulario)</label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Escribe para buscar..."
                            />
                        </div>

                        <div className={styles['form-group']}>
                            <label>Producto</label>
                            <select
                                value={selectedProduct}
                                onChange={(e) => setSelectedProduct(e.target.value)}
                                required
                            >
                                <option value="">-- Seleccionar --</option>
                                {filteredProducts.map(p => (
                                    <option key={p.idProductos} value={p.idProductos}>
                                        {p.NombresProductos}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className={styles['form-group']}>
                            <label>Cantidad</label>
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                required
                            />
                        </div>
                        <div className={styles['form-group']}>
                            <label>Fecha</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>

                        {movementType === 'salida' && (
                            <div className={styles['form-group']}>
                                <label>Motivo</label>
                                <select
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    required={movementType === 'salida'}
                                >
                                    <option value="">-- Seleccionar Motivo --</option>
                                    <option value="Venta Manual">Venta Manual</option>
                                    <option value="Avería/Desperdicio">Avería/Desperdicio</option>
                                    <option value="Consumo Interno">Consumo Interno</option>
                                    <option value="Ajuste Inventario">Ajuste Inventario</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>
                        )}

                        <div className={styles['form-group']}>
                            <PrimaryButton type="submit" className={movementType === 'salida' ? styles['btn-salida'] : ''}>
                                {movementType === 'entrada' ? 'Agregar Stock' : 'Registrar Salida'}
                            </PrimaryButton>
                        </div>
                    </div>
                </form>
                {msg.text && (
                    <div className={msg.type === 'error' ? styles['error-msg'] : styles['success-msg']}>
                        {msg.text}
                    </div>
                )}
            </div>

            {/* Report Table */}
            <div className={styles['report-section']}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 className={styles['report-title']} style={{ marginBottom: 0 }}>Stock del día {new Date().toLocaleDateString()}</h4>
                    <input
                        type="text"
                        placeholder="Buscar en tabla..."
                        value={tableSearchTerm}
                        onChange={(e) => setTableSearchTerm(e.target.value)}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '250px' }}
                    />
                </div>

                {loading && <p>Cargando reporte...</p>}
                <table className={styles['stock-table']}>
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('producto')} style={{ cursor: 'pointer' }}>Producto{getSortIndicator('producto')}</th>
                            <th onClick={() => handleSort('stock_inicial')} style={{ cursor: 'pointer' }}>Stock Inicial{getSortIndicator('stock_inicial')}</th>
                            <th onClick={() => handleSort('entradas_dia')} style={{ cursor: 'pointer' }}>Entradas Hoy{getSortIndicator('entradas_dia')}</th>
                            <th onClick={() => handleSort('salidas_dia')} style={{ cursor: 'pointer' }}>Salidas Hoy{getSortIndicator('salidas_dia')}</th>
                            <th onClick={() => handleSort('stock_final')} style={{ cursor: 'pointer' }}>Stock Final Hoy{getSortIndicator('stock_final')}</th>
                            <th onClick={() => handleSort('salidas_futuras')} style={{ cursor: 'pointer' }}>Salidas Futuras{getSortIndicator('salidas_futuras')}</th>
                            <th onClick={() => handleSort('stock_disponible')} style={{ cursor: 'pointer' }}>Stock Disponible{getSortIndicator('stock_disponible')}</th>
                            <th onClick={() => handleSort('stock_minimo')} style={{ cursor: 'pointer' }}>Stock Mínimo{getSortIndicator('stock_minimo')}</th>
                            <th onClick={() => handleSort('semanas_stock')} style={{ cursor: 'pointer' }}>Semanas Stock{getSortIndicator('semanas_stock')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedReport.map((item, idx) => (
                            <tr key={idx} className={item.stock_disponible < item.stock_minimo ? styles['low-stock'] : ''}>
                                <td title={item.producto}>
                                    {item.producto.length > 30
                                        ? `${item.producto.substring(0, 30)}...`
                                        : item.producto}
                                </td>
                                <td>{item.stock_inicial}</td>
                                <td>{item.entradas_dia}</td>
                                <td>{item.salidas_dia}</td>
                                <td><strong>{item.stock_final}</strong></td>
                                <td>{item.salidas_futuras}</td>
                                <td><strong>{item.stock_disponible}</strong></td>
                                <td>{item.stock_minimo}</td>
                                <td>{item.semanas_stock}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StockManager;
