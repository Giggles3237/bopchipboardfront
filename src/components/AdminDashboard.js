import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import './AdminDashboard.css';
import { format } from 'date-fns';
import { API_BASE_URL } from '../config';

function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const { auth } = useContext(AuthContext);
    const [currentMonthGoal, setCurrentMonthGoal] = useState(0);
    const [teamGoal, setTeamGoal] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');

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
            console.log('API Base URL:', API_BASE_URL);
            console.log('Attempting to fetch users from:', `${API_BASE_URL}/users`);
            const response = await axios.get(`${API_BASE_URL}/users`, {
                headers: { 
                    'Authorization': `Bearer ${auth.token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('Users response:', response.data);
            setUsers(response.data);
            setError(null);
        } catch (err) {
            console.error('Error details:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                endpoint: `${API_BASE_URL}/users`
            });
            setError(`Error fetching users: ${err.response?.data?.message || err.message}`);
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
        
        console.log('Sending form data:', formData);
        
        try {
            if (editingUser) {
                await axios.put(`${API_BASE_URL}/users/${editingUser.id}`, formData, {
                    headers: { Authorization: `Bearer ${auth.token}` }
                });
                setSuccess('User updated successfully');
            } else {
                const response = await axios.post(`${API_BASE_URL}/users`, formData, {
                    headers: { Authorization: `Bearer ${auth.token}` }
                });
                console.log('Server response:', response.data);
                setSuccess('User added successfully');
            }
            fetchUsers();
            setFormData(initialFormState);
            setEditingUser(null);
            setShowAddForm(false);
            setError(null);
        } catch (err) {
            console.error('Error details:', err.response?.data || err.message);
            setError('Error saving user: ' + (err.response?.data?.message || err.response?.data?.error || err.message));
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
                const response = await axios.delete(`${API_BASE_URL}/users/${userId}`, {
                    headers: { Authorization: `Bearer ${auth.token}` }
                });
                
                if (response.status === 200) {
                    setSuccess('User deleted successfully');
                    fetchUsers();
                }
            } catch (err) {
                console.error('Error deleting user:', {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status
                });
                setError(err.response?.data?.message || 'Error deleting user. Please try again.');
            }
        }
    };

    const handleTeamGoalSubmit = async () => {
        try {
            if (!selectedMonth || !teamGoal) {
                alert('Please enter both month and goal value');
                return;
            }

            console.log('Submitting team goal:', {
                month: selectedMonth,
                goal_count: parseInt(teamGoal)
            });

            const response = await axios.post(
                `${API_BASE_URL}/goals/team`,
                {
                    month: selectedMonth,
                    goal_count: parseInt(teamGoal)
                },
                {
                    headers: {
                        'Authorization': `Bearer ${auth.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Goal submission response:', response.data);

            if (response.data) {
                alert('Team goal saved successfully');
                setTeamGoal('');
                fetchCurrentMonthGoal();
            }
        } catch (error) {
            console.error('Error saving team goal:', {
                error,
                response: error.response?.data,
                status: error.response?.status
            });
            alert(`Failed to save team goal: ${error.response?.data?.message || error.message}`);
        }
    };

    const fetchCurrentMonthGoal = useCallback(async () => {
        try {
            const currentMonth = format(new Date(), 'yyyy-MM');
            console.log('Fetching goal for month:', currentMonth);
            
            const response = await axios.get(
                `${API_BASE_URL}/goals/team/${currentMonth}`,
                {
                    headers: { 
                        'Authorization': `Bearer ${auth.token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('Goal response:', response.data);
            
            if (response.data === null || response.data === undefined) {
                console.warn('No data received from team goal endpoint');
                setCurrentMonthGoal(0);
                return;
            }
            
            const goalCount = response.data.goal_count;
            setCurrentMonthGoal(goalCount);
            
        } catch (error) {
            console.error('Error fetching current month goal:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                url: `${API_BASE_URL}/goals/team/${format(new Date(), 'yyyy-MM')}`
            });
            setCurrentMonthGoal(0);
        }
    }, [auth.token]);

    useEffect(() => {
        fetchCurrentMonthGoal();
    }, [fetchCurrentMonthGoal]);

    const handleMonthChange = (e) => {
        setSelectedMonth(e.target.value);
    };

    if (loading) return <div>Loading users...</div>;
    if (error) return <div className="error-message">Error: {error}</div>;

    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>
            
            <div className="team-goal-section">
                <h2>Team Goal Management</h2>
                
                <div className="current-month-goal">
                    <h3>Current Month Goal ({format(new Date(), 'MMMM yyyy')})</h3>
                    <p>{currentMonthGoal}</p>
                </div>

                <div className="goal-form">
                    <div className="form-group">
                        <label>Select Month:</label>
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={handleMonthChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Set New Goal:</label>
                        <input
                            type="number"
                            value={teamGoal}
                            onChange={(e) => setTeamGoal(e.target.value)}
                            placeholder="Enter team goal"
                            min="0"
                        />
                    </div>
                    <button onClick={handleTeamGoalSubmit}>
                        Set Team Goal
                    </button>
                </div>
            </div>

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

            <div className="table-wrapper">
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
        </div>
    );
}

export default AdminDashboard; 