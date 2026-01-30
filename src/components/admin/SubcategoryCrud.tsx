import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import styles from './styles/SubcategoryCrud.module.css';
import PrimaryButton from '../PrimaryButton';

interface Subcategory {
    idSubcategoria: number;
    nombre: string;
    idCategoria: number;
    nombre_categoria: string;
    imagen_url?: string;
}

interface Category {
    idCategoria: number;
    nombre: string;
}

const SubcategoryCrud: React.FC = () => {
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({ idSubcategoria: 0, nombre: '', idCategoria: 0, imagen_url: '' });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchSubcategories();
        fetchCategories();
    }, []);

    const fetchSubcategories = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/subcategorias');
            const data = await res.json();
            if (Array.isArray(data)) setSubcategories(data);
        } catch (err) {
            setError('Error al cargar subcategorías');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/categorias');
            const data = await res.json();
            if (Array.isArray(data)) setCategories(data);
        } catch (err) {
            console.error('Error cargando categorías', err);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (Number(formData.idCategoria) === 0) {
            setError("Selecciona una categoría válida");
            return;
        }
        setError('');

        const url = isEditing
            ? `http://localhost:5000/api/admin/subcategorias/${formData.idSubcategoria}`
            : 'http://localhost:5000/api/admin/subcategorias';

        const method = isEditing ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: formData.nombre,
                    idCategoria: Number(formData.idCategoria),
                    imagen_url: formData.imagen_url
                })
            });

            if (res.ok) {
                fetchSubcategories();
                resetForm();
            } else {
                setError('Error al guardar la subcategoría');
            }
        } catch (err) {
            setError('Error de conexión');
        }
    };

    const handleEdit = (sub: Subcategory) => {
        setFormData({
            idSubcategoria: sub.idSubcategoria,
            nombre: sub.nombre,
            idCategoria: sub.idCategoria,
            imagen_url: sub.imagen_url || ''
        });
        setIsEditing(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Eliminar subcategoría?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/admin/subcategorias/${id}`, { method: 'DELETE' });
            if (res.ok) fetchSubcategories();
            else setError('Error al eliminar');
        } catch (err) {
            setError('Error de conexión');
        }
    };

    const resetForm = () => {
        setFormData({ idSubcategoria: 0, nombre: '', idCategoria: 0, imagen_url: '' });
        setIsEditing(false);
        setError('');
    };

    return (
        <div className={styles['subcategory-crud-container']}>
            <h3>Gestión de Subcategorías</h3>
            {error && <div className={styles['error-msg']}>{error}</div>}

            <div className={styles['subcategory-crud-form']}>
                <h4>{isEditing ? 'Editar Subcategoría' : 'Nueva Subcategoría'}</h4>
                <form onSubmit={handleSubmit}>
                    <div className={styles['form-group-row']}>
                        <div className={styles['form-group']}>
                            <label>Categoría:</label>
                            <select name="idCategoria" value={formData.idCategoria} onChange={handleChange} required>
                                <option value={0}>-- Selecciona --</option>
                                {categories.map(c => (
                                    <option key={c.idCategoria} value={c.idCategoria}>{c.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles['form-group']}>
                            <label>Nombre:</label>
                            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className={styles['form-group']}>
                        <label>URL Imagen (Opcional):</label>
                        <input
                            type="text"
                            name="imagen_url"
                            value={formData.imagen_url}
                            onChange={handleChange}
                            placeholder="https://ejemplo.com/imagen.jpg"
                        />
                    </div>

                    <PrimaryButton type="submit">{isEditing ? 'Actualizar' : 'Crear'}</PrimaryButton>
                    {isEditing && <button type="button" onClick={resetForm} className={styles['btn-secondary']}>Cancelar</button>}
                </form>
            </div>

            <div className={styles['crud-list']}>
                {loading ? <p>Cargando...</p> : (
                    <table className={styles['subcategory-crud-table']}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Categoría Padre</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subcategories.map(sub => (
                                <tr key={sub.idSubcategoria}>
                                    <td>{sub.idSubcategoria}</td>
                                    <td>{sub.nombre}</td>
                                    <td>{sub.nombre_categoria}</td>
                                    <td>
                                        <button onClick={() => handleEdit(sub)} className={styles['btn-icon']}><FaEdit /></button>
                                        <button onClick={() => handleDelete(sub.idSubcategoria)} className={`${styles['btn-icon']} ${styles.delete}`}><FaTrash /></button>
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

export default SubcategoryCrud;
