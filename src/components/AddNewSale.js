import React, { useContext, useState, useEffect } from 'react';
import EditSaleForm from './EditSaleForm';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function AddNewSale() {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const [salespeople, setSalespeople] = useState([]);

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

  const initialSaleData = {
    clientName: '',
    stockNumber: '',
    year: new Date().getFullYear(),
    make: '',
    model: '',
    color: '',
    advisor: '',
    delivered: false,
    deliveryDate: new Date().toISOString().split('T')[0],
    type: ''
  };

  const handleFormSubmit = async (newSale) => {
    try {
      const saleToSubmit = {
        ...newSale,
        advisor: newSale.advisor || auth?.user?.name,
        deliveryDate: format(new Date(newSale.deliveryDate), 'yyyy-MM-dd'),
        year: parseInt(newSale.year) || new Date().getFullYear(),
        delivered: Boolean(newSale.delivered)
      };

      const response = await axios.post(
        `${API_BASE_URL}/sales`, 
        saleToSubmit,
        {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 201 || response.status === 200) {
        alert('Sale added successfully!');
        navigate('/');
      }
    } catch (error) {
      console.error('Error details:', error.response?.data);
      alert(`Error adding new sale: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div>
      <h2>Add New Sale</h2>
      <EditSaleForm
        sale={initialSaleData}
        onSubmit={handleFormSubmit}
        onCancel={() => navigate('/')}
        salespeople={salespeople}
      />
    </div>
  );
}

export default AddNewSale; 