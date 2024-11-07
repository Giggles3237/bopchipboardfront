import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './AdminDashboard.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const { auth } = useAuth();

    const initialFormState = {
        name: '',
        email: '',
        password: '',
        role: 'Salesperson',
        organization: '',
        status: 'active'
    };
    
    const [formData, setFormData] = useState(initialFormState);

    const fetchUsers = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/users`, {
                headers: { 
                    'Authorization': `Bearer ${auth.token}`
                }
            });
            setUsers(response.data);
            setError(null);
        } catch (err) {
            setError('Error fetching users: ' + err.message);
        } finally {
            setLoading(false);
        }
    }, [auth.token]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingUser) {
                await axios.put(`${API_BASE_URL}/users/${editingUser.id}`, formData, {
                    headers: { Authorization: `Bearer ${auth.token}` }
                });
                setSuccess('User updated successfully');
            } else {
                await axios.post(`${API_BASE_URL}/users`, formData, {
                    headers: { Authorization: `Bearer ${auth.token}` }
                });
                setSuccess('User added successfully');
            }
            fetchUsers();
            setFormData(initialFormState);
            setEditingUser(null);
            setShowAddForm(false);
            setError(null);
        } catch (err) {
            setError('Error saving user: ' + err.message);
            setSuccess('');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role_name || user.role,
            organization: user.organization_name || user.organization,
            status: user.status || 'active'
        });
        setShowAddForm(true);
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await axios.delete(`${API_BASE_URL}/users/${userId}`, {
                    headers: { Authorization: `Bearer ${auth.token}` }
                });
                fetchUsers();
            } catch (err) {
                setError('Error deleting user: ' + err.message);
            }
        }
    };

    if (loading) return <div>Loading users...</div>;
    if (error) return <div className="error-message">Error: {error}</div>;

    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>
            
            <button 
                onClick={() => {
                    setShowAddForm(true);
                    setEditingUser(null);
                    setFormData(initialFormState);
                }}
                className="add-user-button"
            >
                <i className="fas fa-plus"></i> Add New User
            </button>

            {showAddForm && (
                <div className="add-user-modal">
                    <div className="add-user-form">
                        <button className="close-button" onClick={() => setShowAddForm(false)}>
                            ×
                        </button>
                        <h2>{editingUser ? 'Edit User' : 'Add New User'}</h2>
                        
                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}
                        
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="name">Full Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="role">Role</label>
                                <select
                                    id="role"
                                    name="role"
                                    value={formData.role || ''}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select a role</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Manager">Manager</option>
                                    <option value="Salesperson">Salesperson</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="organization">Organization</label>
                                <input
                                    id="organization"
                                    type="text"
                                    name="organization"
                                    value={formData.organization || ''}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-actions">
                                <button 
                                    type="button" 
                                    className="cancel-btn"
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setEditingUser(null);
                                        setFormData(initialFormState);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="submit-btn"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Saving...' : editingUser ? 'Save Changes' : 'Add User'}
                                </button>
                                {editingUser && (
                                    <button 
                                        type="button"
                                        className="delete-btn"
                                        onClick={() => handleDelete(editingUser.id)}
                                    >
                                        Delete User
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="users-table">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Organization</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.role_name}</td>
                                <td>{user.organization_name}</td>
                                <td>{user.status}</td>
                                <td>
                                    <button onClick={() => handleEdit(user)}>Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminDashboard; 