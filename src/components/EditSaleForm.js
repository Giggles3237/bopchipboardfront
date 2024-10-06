import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './EditSaleForm.css';

function EditSaleForm({ sale, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    clientName: '',
    stockNumber: '',
    year: '',
    make: '',
    model: '',
    color: '',
    advisor: '',
    delivered: false,
    deliveryDate: null,
    type: ''
  });

  useEffect(() => {
    if (sale) {
      setFormData({
        ...sale,
        deliveryDate: sale.deliveryDate ? new Date(sale.deliveryDate) : null
      });
    }
  }, [sale]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting sale:', formData); // Debugging log
    onSubmit({
      ...formData,
      deliveryDate: formData.deliveryDate ? formData.deliveryDate.toISOString() : null
    });
  };

  const vehicleTypes = [
    'New BMW',
    'CPO BMW',
    'Used BMW',
    'New MINI',
    'CPO MINI',
    'Used MINI'
  ];

  return (
    <div className="edit-sale-form-overlay">
      <div className="edit-sale-form">
        <h2>{sale ? 'Edit Sale' : 'Add New Sale'}</h2>
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
            <input
              type="text"
              id="advisor"
              name="advisor"
              value={formData.advisor}
              onChange={handleChange}
              required
            />
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
              selected={formData.deliveryDate}
              onChange={handleDateChange}
              dateFormat="yyyy/MM/dd"
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
            <button type="submit">{sale ? 'Save Changes' : 'Add Sale'}</button>
            <button type="button" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditSaleForm;
