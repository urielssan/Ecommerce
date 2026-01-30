import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import styles from './styles/ProductCrud.module.css';
import PrimaryButton from '../PrimaryButton';

// Reutilizamos tipos si es posible, o definimos localmente para rapidez
interface Product {
    idProductos: number;
    NombresProductos: string;
    NombreSimple?: string;
    Precio: number;
    descripcion: string;
    descripcionProducto: string;
    marca: string;
    valor_propiedad_1: string;
    nombre_propiedad_1: string;
    tags: string;
    seo_descripcion: string;
    nombre_subcategoria?: string;
    nombre_categoria?: string;
    idSubcategoria?: number;
    // New Fields
    IngredientesSugeridos?: string;
    InstruccionesMantenimiento?: string;
    SugerenciasCoccion?: string;
    EsUltracongelado?: number | boolean; // 0/1 from DB, boolean in form
    TieneSugerenciasCoccion?: number | boolean;
    Porcion?: string;
    barcode?: string;
    slug?: string;
    UrlImagen?: string;
}

interface Subcategory {
    idSubcategoria: number;
    nombre: string;
}

const ProductCrud: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Estado inicial
    const initialForm = {
        idProductos: 0,
        NombresProductos: '',
        NombreSimple: '',
        Precio: 0,
        descripcion: '', // Descripcion corta (unused in UI but kept for DB)
        descripcionProducto: '', // "Descripción (Beneficios)"
        marca: '',
        valor_propiedad_1: '',
        nombre_propiedad_1: '',
        tags: '',
        seo_descripcion: '',
        idSubcategoria: 0,
        // New
        IngredientesSugeridos: '',
        InstruccionesMantenimiento: '',
        SugerenciasCoccion: '',
        EsUltracongelado: false,
        TieneSugerenciasCoccion: false,
        Porcion: '',
        barcode: '',
        slug: '',
        UrlImagen: ''
    };

    const [formData, setFormData] = useState(initialForm);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProducts();
        fetchSubcategories();
    }, []);

    const filteredProducts = products.filter(p =>
        p.NombresProductos.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.nombre_subcategoria?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/productos');
            const data = await res.json();
            if (Array.isArray(data)) setProducts(data);
        } catch (err) {
            setError('Error al cargar productos');
        } finally {
            setLoading(false);
        }
    };

    const fetchSubcategories = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/subcategorias');
            const data = await res.json();
            if (Array.isArray(data)) setSubcategories(data);
        } catch (err) { console.error(err); }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData({ ...formData, [name]: checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const url = isEditing
            ? `http://localhost:5000/api/admin/productos/${formData.idProductos}`
            : 'http://localhost:5000/api/admin/productos';
        const method = isEditing ? 'PUT' : 'POST';

        // Prepare info for API (convert bools to 0/1 if needed by your DB, or let backend handle)
        // SQL usually expects 0/1 for BOOLEAN if using specific drivers, but TRUE/FALSE often works.
        // Let's assume sending boolean JSON is fine for Flask/MySQL connector if handled.

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                fetchProducts();
                resetForm();
            } else {
                setError('Error al guardar producto');
            }
        } catch (err) {
            setError('Error de conexión');
        }
    };

    const handleEdit = (prod: Product) => {
        // Fetch full details to ensure we have all fields
        fetchProductDetail(prod.idProductos);
    };

    const fetchProductDetail = async (id: number) => {
        try {
            const res = await fetch(`http://localhost:5000/api/productos/${id}`);
            const data = await res.json();
            if (data) {
                setFormData({
                    idProductos: data.idProductos,
                    NombresProductos: data.NombresProductos || '',
                    NombreSimple: data.NombreSimple || '',
                    Precio: data.Precio || 0,
                    descripcion: data.descripcion || '',
                    descripcionProducto: data.descripcionProducto || '',
                    marca: data.marca || '',
                    valor_propiedad_1: data.valor_propiedad_1 || '',
                    nombre_propiedad_1: data.nombre_propiedad_1 || '',
                    tags: data.tags || '',
                    seo_descripcion: data.seo_descripcion || '',
                    idSubcategoria: data.idSubcategoria || 0,
                    IngredientesSugeridos: data.IngredientesSugeridos || '',
                    InstruccionesMantenimiento: data.InstruccionesMantenimiento || '',
                    SugerenciasCoccion: data.SugerenciasCoccion || '',
                    EsUltracongelado: !!data.EsUltracongelado,
                    TieneSugerenciasCoccion: !!data.TieneSugerenciasCoccion,
                    Porcion: data.Porcion || '',
                    barcode: data.barcode || '',
                    slug: data.slug || '',
                    UrlImagen: data.UrlImagen || ''
                });
                setIsEditing(true);
                window.scrollTo(0, 0);
            }
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Eliminar producto?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/admin/productos/${id}`, { method: 'DELETE' });
            if (res.ok) fetchProducts();
        } catch (err) { setError('Error eliminando'); }
    };

    const resetForm = () => {
        setFormData(initialForm);
        setIsEditing(false);
    };

    return (
        <div className={styles['product-crud-container']}>
            <h3>Gestión de Productos</h3>
            {error && <div className={styles['error-msg']}>{error}</div>}

            <div className={styles['product-crud-form']}>
                <h4>{isEditing ? 'Editar Producto' : 'Agregar Nuevo Producto'}</h4>
                <form onSubmit={handleSubmit}>
                    <div className={styles['form-grid']}>
                        {/* Section 1 */}
                        <div className={styles['section-divider']}>Información Principal</div>

                        <div className={styles['form-group']}>
                            <label>Nombre del Producto *</label>
                            <input
                                type="text"
                                name="NombresProductos"
                                value={formData.NombresProductos}
                                onChange={handleChange}
                                required
                                placeholder="Ej: Milanesa de Soja Rellena"
                            />
                        </div>
                        <div className={styles['form-group']}>
                            <label>Precio *</label>
                            <input
                                type="number"
                                name="Precio"
                                value={formData.Precio}
                                onChange={handleChange}
                                required
                                placeholder="0.00"
                            />
                        </div>
                        <div className={styles['form-group']}>
                            <label>Subcategoría</label>
                            <select name="idSubcategoria" value={formData.idSubcategoria} onChange={handleChange} required>
                                <option value={0}>-- Seleccionar --</option>
                                {subcategories.map(s => <option key={s.idSubcategoria} value={s.idSubcategoria}>{s.nombre}</option>)}
                            </select>
                        </div>

                        <div className={styles['form-group']}>
                            <label>Nombre Simple (Opcional)</label>
                            <input
                                type="text"
                                name="NombreSimple"
                                value={formData.NombreSimple}
                                onChange={handleChange}
                                placeholder="Si está vacío, usa el nombre principal"
                            />
                        </div>
                        <div className={styles['form-group']}>
                            <label>Porción</label>
                            <input type="text" name="Porcion" value={formData.Porcion} onChange={handleChange} placeholder="Ej: 2 unidades" />
                        </div>
                        <div className={styles['form-group']}>
                            <label>Código de Barras</label>
                            <input
                                type="text"
                                name="barcode"
                                value={formData.barcode}
                                readOnly
                                placeholder="Se generará automáticamente"
                                style={{ background: '#e9ecef', color: '#666', cursor: 'not-allowed' }}
                            />
                        </div>

                        {/* Section 2 */}
                        <div className={styles['section-divider']}>Detalles & Multimedia</div>

                        <div className={styles['form-group']}>
                            <label>URL Imagen (Google Drive / Nube)</label>
                            <input type="text" name="UrlImagen" value={formData.UrlImagen} onChange={handleChange} placeholder="https://..." />
                        </div>

                        <div className={styles['form-group']}>
                            <label>Ingredientes</label>
                            <textarea
                                name="IngredientesSugeridos"
                                value={formData.IngredientesSugeridos}
                                onChange={handleChange}
                                rows={2}
                                placeholder="Harina, agua, sal..."
                            />
                        </div>

                        <div className={styles['form-group']}>
                            <label>Descripción / Beneficios</label>
                            <textarea
                                name="descripcionProducto"
                                value={formData.descripcionProducto}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Descripción detallada del producto..."
                            />
                        </div>

                        {/* Section 3 */}
                        <div className={styles['section-divider']}>Instrucciones & Extras</div>

                        <div className={styles['checkbox-center']} onClick={() => {
                            const newState = !formData.EsUltracongelado;
                            setFormData({
                                ...formData,
                                EsUltracongelado: newState,
                                InstruccionesMantenimiento: newState
                                    ? "Producto ultracongelado envasado al vacío. Conservar en frío. UNA VEZ DESCONGELADO, NO VOLVER A CONGELAR."
                                    : ""
                            });
                        }}>
                            <input
                                type="checkbox"
                                name="EsUltracongelado"
                                checked={!!formData.EsUltracongelado}
                                onChange={() => { }}
                            />
                            <label>Es Producto Ultracongelado</label>
                        </div>

                        {!formData.EsUltracongelado && (
                            <div className={styles['form-group']}>
                                <label>Instrucciones de Mantenimiento</label>
                                <textarea
                                    name="InstruccionesMantenimiento"
                                    value={formData.InstruccionesMantenimiento}
                                    onChange={handleChange}
                                    rows={2}
                                    placeholder="Mantener congelado a -18°C..."
                                />
                            </div>
                        )}

                        <div className={styles['checkbox-center']} onClick={() => setFormData({ ...formData, TieneSugerenciasCoccion: !formData.TieneSugerenciasCoccion })}>
                            <input
                                type="checkbox"
                                name="TieneSugerenciasCoccion"
                                checked={!!formData.TieneSugerenciasCoccion}
                                onChange={() => { }}
                            />
                            <label>Incluir Sugerencias de Cocción</label>
                        </div>



                        {formData.TieneSugerenciasCoccion ? (
                            <div className={`${styles['form-group']} ${styles['span-full']}`}>
                                <label>Texto de Sugerencias de Cocción</label>
                                <textarea name="SugerenciasCoccion" value={formData.SugerenciasCoccion} onChange={handleChange} rows={3} />
                            </div>
                        ) : null}
                    </div>

                    <div className={styles['form-actions']}>
                        <PrimaryButton type="submit">{isEditing ? 'Guardar Cambios' : 'Crear Producto'}</PrimaryButton>
                        {isEditing && <button type="button" onClick={resetForm} className={styles['btn-secondary']}>Cancelar</button>}
                    </div>
                </form>
            </div>

            <div className={styles['crud-list']}>
                <div className={styles['search-container']}>
                    <input
                        type="text"
                        placeholder="Buscar producto por nombre o subcategoría..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles['search-input']}
                    />
                </div>

                {loading ? <p>Cargando...</p> : (
                    <table className={styles['product-crud-table']}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Precio</th>
                                <th>Subcategoría</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(p => (
                                <tr key={p.idProductos}>
                                    <td>{p.idProductos}</td>
                                    <td>{p.NombresProductos}</td>
                                    <td>${p.Precio}</td>
                                    <td>{p.nombre_subcategoria}</td>
                                    <td>
                                        <div className={styles['actions-cell']}>
                                            <button onClick={() => handleEdit(p)} className={styles['btn-icon']}><FaEdit /></button>
                                            <button onClick={() => handleDelete(p.idProductos)} className={`${styles['btn-icon']} ${styles.delete}`}><FaTrash /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ProductCrud;
