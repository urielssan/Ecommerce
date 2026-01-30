import { FaEdit, FaTrash } from 'react-icons/fa';
import React, { useState, useEffect } from 'react';
import styles from './styles/CategoryCrud.module.css';
import PrimaryButton from '../PrimaryButton';

interface Category {
    idCategoria: number;
    nombre: string;
    imagen_url?: string;
}

const CategoryCrud: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Estado del formulario
    const [formData, setFormData] = useState({ idCategoria: 0, nombre: '', imagen_url: '' });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/categorias');
            const data = await res.json();
            if (Array.isArray(data)) {
                setCategories(data);
            } else {
                // Si devuelve error
                console.error("Error fetching categories:", data);
            }
        } catch (err) {
            setError('Error al cargar categorías');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const url = isEditing
            ? `http://localhost:5000/api/admin/categorias/${formData.idCategoria}`
            : 'http://localhost:5000/api/admin/categorias';

        const method = isEditing ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}` // Aquí iría el token si lo protegiéramos estrictamente
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                fetchCategories();
                resetForm();
            } else {
                setError('Error al guardar la categoría');
            }
        } catch (err) {
            setError('Error de conexión');
        }
    };

    const handleEdit = (cat: Category) => {
        setFormData({
            idCategoria: cat.idCategoria,
            nombre: cat.nombre,
            imagen_url: cat.imagen_url || ''
        });
        setIsEditing(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Estás seguro de eliminar esta categoría?')) return;

        try {
            const res = await fetch(`http://localhost:5000/api/admin/categorias/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchCategories();
            } else {
                setError('Error al eliminar');
            }
        } catch (err) {
            setError('Error de conexión');
        }
    };

    const resetForm = () => {
        setFormData({ idCategoria: 0, nombre: '', imagen_url: '' });
        setIsEditing(false);
    };

    return (
        <div className={styles['category-crud-container']}>
            <h3>Gestión de Categorías</h3>

            {error && <div className={styles['error-msg']}>{error}</div>}

            <div className={styles['category-crud-form']}>
                <h4>{isEditing ? 'Editar Categoría' : 'Nueva Categoría'}</h4>
                <form onSubmit={handleSubmit}>
                    <div className={styles['form-group']}>
                        <label>Nombre:</label>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                        />
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
                    <PrimaryButton type="submit">
                        {isEditing ? 'Actualizar' : 'Crear'}
                    </PrimaryButton>
                    {isEditing && (
                        <button type="button" onClick={resetForm} className={styles['btn-secondary']}>
                            Cancelar
                        </button>
                    )}
                </form>
            </div>

            <div className={styles['crud-list']}>
                {loading ? <p>Cargando...</p> : (
                    <table className={styles['category-crud-table']}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map(cat => (
                                <tr key={cat.idCategoria}>
                                    <td>{cat.idCategoria}</td>
                                    <td>{cat.nombre}</td>
                                    <td>
                                        <button onClick={() => handleEdit(cat)} className={styles['btn-icon']}><FaEdit /></button>
                                        <button onClick={() => handleDelete(cat.idCategoria)} className={`${styles['btn-icon']} ${styles.delete}`}><FaTrash /></button>
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

export default CategoryCrud;
