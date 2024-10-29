import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Import separate components
import ChipTable from './components/ChipTable';
import SalesTable from './components/SalesTable';
import EditSaleForm from './components/EditSaleForm';
import DateRangePicker from './components/DateRangePicker';
import Header from './components/Header';
import Inbound from './components/Inbound';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

const API_BASE_URL = 'https://bopchipboard-c66df77a754d.herokuapp.com/api'; // Update this to match your backend server's address

function App() {
  const [sales, setSales] = useState([]);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingSale, setEditingSale] = useState(null);

  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/sales`);
      console.log('Fetched sales:', response.data);
      setSales(response.data);
    } catch (error) {
      console.error('Error fetching sales:', error);
      setError(`Failed to fetch sales data: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const handleDateChange = useCallback((start, end) => {
    console.log('Date range changed:', start, end);
    setStartDate(start);
    setEndDate(end);
  }, []);

  const handleSearch = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      if (!sale) return false;
      
      const saleDate = new Date(sale.deliveryDate);
      saleDate.setHours(0, 0, 0, 0); // Reset time to midnight for accurate date comparison

      const dateMatch = 
        (!startDate || saleDate >= startDate) && 
        (!endDate || saleDate <= endDate);

      const searchMatch = Object.values(sale).some(value => 
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );

      return dateMatch && searchMatch;
    });
  }, [sales, startDate, endDate, searchTerm]);

  const handleEditSubmit = useCallback(async (updatedSale) => {
    try {
      console.log('Updating sale:', updatedSale); // Debugging log
      await axios.put(`${API_BASE_URL}/sales/${updatedSale.id}`, updatedSale);
      await fetchSales(); // Refresh the sales data
      setEditingSale(null);
    } catch (error) {
      console.error('Error saving sale:', error);
      setError(`Failed to update sale: ${error.response?.data?.message || error.message}`);
    }
  }, [fetchSales]);

  const handleDelete = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to delete this sale?')) {
      try {
        await axios.delete(`${API_BASE_URL}/sales/${id}`);
        await fetchSales();
      } catch (error) {
        console.error('Error deleting sale:', error);
        setError(`Failed to delete sale: ${error.response?.data?.message || error.message}`);
      }
    }
  }, [fetchSales]);

  const addNewSale = async (newSale) => {
    try {
      console.log('Sending new sale data:', newSale); // Debugging log
      const response = await axios.post(`${API_BASE_URL}/sales`, newSale);
      console.log('Sale added:', response.data);
      await fetchSales(); // Refresh the sales data
    } catch (error) {
      console.error('Error adding sale:', error);
      setError(`Failed to add sale: ${error.response?.data?.message || error.message}`);
    }
  };

  const AddNewSale = () => {
    const navigate = useNavigate();
    return (
      <EditSaleForm 
        onSubmit={(newSale) => {
          addNewSale(newSale); // Use the new function for adding sales
          navigate('/table');
        }} 
        onCancel={() => navigate('/table')} 
      />
    );
  };

  // Remove the following function:
  // const fetchPendingSales = async () => {
  //   try {
  //     const response = await axios.get(`${API_BASE_URL}/pending-sales`);
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error fetching pending sales:', error);
  //     throw error;
  //   }
  // };

  return (
    <Router>
      <div className="App">
        <Header />
        <nav>
          <ul>
            <li><Link to="/">Chip View</Link></li>
            <li><Link to="/table">Sales Table</Link></li>
            <li><Link to="/add">Add New Sale</Link></li>
            <li><Link to="/inbound">Inbound</Link></li>
          </ul>
        </nav>

        {error && <div className="error-message">{error}</div>}

        <Routes>
          <Route path="/" element={
            <>
              <h1>Sales Dashboard</h1>
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onDateChange={handleDateChange}
              />
              <input
                type="text"
                placeholder="Search sales..."
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
              {loading ? (
                <div>Loading sales data...</div>
              ) : filteredSales.length > 0 ? (
                <ChipTable sales={filteredSales} onEdit={setEditingSale} />
              ) : (
                <div>No sales data available. {error ? `Error: ${error}` : ''}</div>
              )}
            </>
          } />
          <Route path="/table" element={
            <>
              <h1>Sales Table</h1>
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onDateChange={handleDateChange}
              />
              <input
                type="text"
                placeholder="Search sales..."
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
              {loading ? (
                <div>Loading sales data...</div>
              ) : (
                <SalesTable 
                  sales={filteredSales} 
                  onEdit={setEditingSale}
                  onDelete={handleDelete}
                />
              )}
            </>
          } />
          <Route path="/add" element={<AddNewSale />} />
          <Route path="/inbound" element={<Inbound />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
        </Routes>

        {editingSale && (
          <EditSaleForm
            sale={editingSale}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditingSale(null)}
          />
        )}

        {/* Add the footer here, before the closing div */}
        <footer className="footer">
          <div className="footer-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Use</Link>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
