import React, { useState } from 'react';
import './EditSaleForm.css';

function EditSaleForm({ sale, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    ...sale,
    deliveryDate: sale.deliveryDate.toISOString().split('T')[0] // Format date for input
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      deliveryDate: new Date(formData.deliveryDate) // Convert back to Date object
    });
  };

  return (
    <div className="edit-sale-form-overlay">
      <div className="edit-sale-form">
        <h2>Edit Sale</h2>
        <form onSubmit={handleSubmit}>
          {/* ... other form fields ... */}
          <div>
            <label htmlFor="deliveryDate">Delivery Date:</label>
            <input
              type="date"
              id="deliveryDate"
              name="deliveryDate"
              value={formData.deliveryDate}
              onChange={handleChange}
              required
            />
          </div>
          {/* ... other form fields ... */}
          <div className="form-buttons">
            <button type="submit">Save Changes</button>
            <button type="button" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditSaleForm;