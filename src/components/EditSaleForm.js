import React, { useState, useContext, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './EditSaleForm.css';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://bopchipboard-c66df77a754d.herokuapp.com/api';

function EditSaleForm({ sale, onSubmit, onCancel, onDelete }) {
  const { auth } = useContext(AuthContext);
  const [salespeople, setSalespeople] = useState([]);

  // Add useEffect to fetch salespeople
  useEffect(() => {
    const fetchSalespeople = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/users/salespeople-and-managers`, {
          headers: {
            'Authorization': `Bearer ${auth.token}`
          }
        });
        setSalespeople(response.data);
      } catch (error) {
        console.error('Error fetching salespeople:', error);
      }
    };

    fetchSalespeople();
  }, [auth.token]);

  const [formData, setFormData] = useState({
    ...sale,
    deliveryDate: sale.deliveryDate instanceof Date 
      ? sale.deliveryDate.toISOString().split('T')[0]
      : new Date(sale.deliveryDate).toISOString().split('T')[0],
    advisor: sale.advisor || (auth?.user?.role === 'Salesperson' ? auth.user.name : '')
  });

  // Add console logs to debug
  console.log('Auth state:', auth);
  console.log('Current sale:', sale);

  useEffect(() => {
    // Check if we're authenticated
    if (!auth?.token) {
      console.error('No authentication token found');
      // Optionally redirect to login
      // window.location.href = '/login';
    }
  }, [auth]);

  // Add validation check at the start of component
  useEffect(() => {
    if (auth?.user?.role === 'Salesperson' && sale.advisor && sale.advisor !== auth.user.name) {
      alert('You can only edit your own sales.');
      onCancel();
    }
  }, [auth, sale, onCancel]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prevData => ({
      ...prevData,
      deliveryDate: date
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('EditSaleForm: Starting form submission');
    
    if (auth?.user?.role === 'Salesperson' && sale.advisor && sale.advisor !== auth.user.name) {
      alert('You can only edit your own sales.');
      return;
    }
    
    try {
      const formattedDate = formData.deliveryDate instanceof Date 
        ? formData.deliveryDate.toISOString().split('T')[0]
        : new Date(formData.deliveryDate).toISOString().split('T')[0];

      const submissionData = {
        ...formData,
        id: sale.id,
        deliveryDate: formattedDate,
        delivered: Boolean(formData.delivered)
      };
      
      console.log('EditSaleForm: Submission data prepared:', submissionData);
      
      await onSubmit(submissionData);
      console.log('EditSaleForm: Submit successful');
      onCancel(); // Only call onCancel after successful submission
      
    } catch (error) {
      console.error('EditSaleForm: Error in handleSubmit:', error);
      alert(`Error saving changes: ${error.message}`);
    }
  };

  const handleCancel = () => {
    console.log('Cancel clicked');
    onCancel();
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this sale? This action cannot be undone.')) {
      try {
        await onDelete(sale);
        onCancel(); // Close the form after successful deletion
      } catch (error) {
        console.error('Error deleting sale:', error);
        alert(`Error deleting sale: ${error.message}`);
      }
    }
  };

  const vehicleTypes = [
    'New BMW',
    'CPO BMW',
    'Used BMW',
    'New MINI',
    'CPO MINI',
    'Used MINI'
  ];

  console.log('onSubmit:', onSubmit);

  return (
    <div className="edit-sale-form-overlay">
      <div className="edit-sale-form">
        <h2>{sale.id ? 'Edit Sale' : 'Add New Sale'}</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="clientName">Client Name:</label>
            <input
              type="text"
              id="clientName"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="stockNumber">Stock Number:</label>
            <input
              type="text"
              id="stockNumber"
              name="stockNumber"
              value={formData.stockNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="year">Year:</label>
            <input
              type="number"
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="make">Make:</label>
            <input
              type="text"
              id="make"
              name="make"
              value={formData.make}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="model">Model:</label>
            <input
              type="text"
              id="model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="color">Color:</label>
            <input
              type="text"
              id="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="advisor">Advisor:</label>
            <select
              id="advisor"
              name="advisor"
              value={formData.advisor || ''}
              onChange={handleChange}
              required
            >
              <option value="">Select Advisor</option>
              {auth?.user?.role === 'Salesperson' ? (
                <option value={auth.user.name}>{auth.user.name}</option>
              ) : (
                <>
                  {salespeople.map(person => (
                    <option key={person.id} value={person.name}>
                      {person.name} ({person.role})
                    </option>
                  ))}
                  <option value="House">House</option>
                </>
              )}
            </select>
          </div>
          <div>
            <label htmlFor="delivered">Delivered:</label>
            <input
              type="checkbox"
              id="delivered"
              name="delivered"
              checked={formData.delivered}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="deliveryDate">Delivery Date:</label>
            <DatePicker
              selected={formData.deliveryDate instanceof Date ? formData.deliveryDate : new Date(formData.deliveryDate)}
              onChange={handleDateChange}
              dateFormat="yyyy-MM-dd"
              id="deliveryDate"
              name="deliveryDate"
              required
            />
          </div>
          <div>
            <label htmlFor="type">Type:</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="">Select Type</option>
              {vehicleTypes.map((type, index) => (
                <option key={index} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="form-buttons">
            <button type="submit" className="save-button">Save Changes</button>
            {sale.id && !formData.delivered && ( // Only show delete button for existing, undelivered sales
              <button 
                type="button" 
                className="delete-button"
                onClick={handleDelete}
                title="Delete Sale"
              >
                🗑️
              </button>
            )}
            <button type="button" onClick={handleCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditSaleForm;
