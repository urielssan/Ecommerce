import React, { useState, useEffect } from 'react';
import { FamilyMember } from '../../types';
import styles from './styles/FamilyMembersCrud.module.css';
import PrimaryButton from '../PrimaryButton';

const FamilyMembersCrud: React.FC = () => {
    const [members, setMembers] = useState<FamilyMember[]>([]);
    const [formData, setFormData] = useState<Partial<FamilyMember>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/miembros`);
            if (response.ok) {
                const data = await response.json();
                setMembers(data);
            } else {
                setError('Error al cargar miembros');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.dni || !formData.nombre || !formData.apellido) {
            setError('DNI, Nombre y Apellido son obligatorios');
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/miembros`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setSuccess('Miembro agregado correctamente');
                setFormData({});
                fetchMembers();
            } else {
                const errData = await response.json();
                setError(errData.error || 'Error al agregar miembro');
            }
        } catch (err) {
            setError('Error de conexión');
        }
    };

    const handleDelete = async (dni: string) => {
        if (!window.confirm('¿Seguro que deseas eliminar este miembro?')) return;
        try {
            await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/admin/miembros/${dni}`, { method: 'DELETE' });
            fetchMembers();
        } catch (err) {
            alert('Error al eliminar');
        }
    };

    return (
        <div className={styles['family-crud-container']}>
            <h3>Gestión de Clientes Fieles (Familia)</h3>

            <form className={styles['family-form']} onSubmit={handleSubmit}>
                <div className={styles['form-group']}>
                    <label>DNI</label>
                    <input name="dni" value={formData.dni || ''} onChange={handleChange} placeholder="DNI" />
                </div>
                <div className={styles['form-group']}>
                    <label>Nombre</label>
                    <input name="nombre" value={formData.nombre || ''} onChange={handleChange} placeholder="Nombre" />
                </div>
                <div className={styles['form-group']}>
                    <label>Apellido</label>
                    <input name="apellido" value={formData.apellido || ''} onChange={handleChange} placeholder="Apellido" />
                </div>
                <div className={styles['form-group']}>
                    <label>Dirección</label>
                    <input name="direccion" value={formData.direccion || ''} onChange={handleChange} placeholder="Dirección" />
                </div>
                <div className={styles['form-group']}>
                    <label>Teléfono</label>
                    <input name="telefono" value={formData.telefono || ''} onChange={handleChange} placeholder="Teléfono" />
                </div>
                <div className={styles['form-group']}>
                    <label>Email</label>
                    <input name="email" type="email" value={formData.email || ''} onChange={handleChange} placeholder="Email" />
                </div>
                <div className={styles['form-group']}>
                    <label>Nacimiento</label>
                    <input name="fecha_nacimiento" type="date" value={formData.fecha_nacimiento || ''} onChange={handleChange} />
                </div>
                <div className={styles['form-group']}>
                    <label>Sexo</label>
                    <select name="sexo" value={formData.sexo || ''} onChange={handleChange}>
                        <option value="">Seleccionar</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                        <option value="Otro">Otro</option>
                    </select>
                </div>
                <PrimaryButton type="submit" className={styles['btn-add']}>Agregar Miembro</PrimaryButton>
            </form>

            {error && <p className={styles['error-msg']}>{error}</p>}
            {success && <p className={styles['success-msg']}>{success}</p>}

            <div className={styles['members-list']}>
                <h4>Lista de Miembros</h4>
                {loading ? <p>Cargando...</p> : (
                    <table>
                        <thead>
                            <tr>
                                <th>DNI</th>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.map(m => (
                                <tr key={m.dni}>
                                    <td>{m.dni}</td>
                                    <td>{m.nombre} {m.apellido}</td>
                                    <td>{m.email}</td>
                                    <td>
                                        <button onClick={() => handleDelete(m.dni)} className={styles['btn-delete']}>Eliminar</button>
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

export default FamilyMembersCrud;
