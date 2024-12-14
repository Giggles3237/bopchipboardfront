import React, { useState, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from './config';
// Import your components
import ChipTable from './components/ChipTable';
import DateRangePicker from './components/DateRangePicker';
import NavbarComponent from './components/Navbar';
import Inbound from './components/Inbound';
import AddNewSale from './components/AddNewSale';
import EditSaleForm from './components/EditSaleForm';
import Login from './components/Login';
import { AuthContext } from './contexts/AuthContext';
import SalesTable from './components/SalesTable';
import AdminDashboard from './components/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';
import ViewToggleBar from './components/ViewToggleBar';
import ChangePasswordForm from './components/ChangePasswordForm';
import './App.css';
import SalespersonDashboard from './components/SalespersonDashboard';

/**
 * App Component
 * The main component that sets up routing, manages global state, and handles data fetching
 */
function App() {
  const { auth } = useContext(AuthContext); // Access authentication context
  const [searchTerm, setSearchTerm] = useState(''); // State for search input
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1); // Initialize to first day of current month
  });
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth() + 1, 0); // Initialize to last day of current month
  });
  const [editingSale, setEditingSale] = useState(null); // State to track which sale is being edited
  const [sales, setSales] = useState([]); // All sales data
  const [filteredSales, setFilteredSales] = useState(null); // Sales data after filtering
  const [searchArchive, setSearchArchive] = useState(false); // Whether to include archived sales in search
  const [loading, setLoading] = useState(false); // Loading state for data fetching
  const [error, setError] = useState(null); // Error state for data fetching
  const [isDarkMode, setIsDarkMode] = useState(false);

  /**
   * useEffect to fetch sales data from the backend API whenever authentication token, start date, or end date changes
   */
  useEffect(() => {
    const fetchSales = async () => {
      setLoading(true);
      try {
        console.log('Fetching sales with token:', auth?.token);
        const response = await axios.get(`${API_BASE_URL}/sales`, {
          headers: {
            Authorization: `Bearer ${auth?.token}`
          }
        });
        console.log('Sales response:', response.data);
        setSales(response.data);
        // Filter sales within the selected date range
        const filtered = response.data.filter(sale => {
          const saleDate = new Date(sale.deliveryDate);
          return saleDate >= startDate && saleDate <= endDate;
        });
        setFilteredSales(filtered);
      } catch (error) {
        setError('Failed to fetch sales data.');
        console.error('Error fetching sales:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch sales data only if the user is authenticated
    if (auth?.token) {
      fetchSales();
    }
  }, [auth?.token, startDate, endDate]);

  /**
   * Handler for search input changes
   * Filters sales based on the search term and archive toggle state
   */
  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);
    
    const filtered = sales.filter(sale => {
      // Check if any field of the sale contains the search term
      const matchesSearch = Object.values(sale).some(value => 
        String(value).toLowerCase().includes(searchValue)
      );
      
      if (searchArchive) {
        // If archive search is enabled, include all matching sales
        return matchesSearch;
      } else {
        // Otherwise, include only sales within the date range
        const saleDate = new Date(sale.deliveryDate);
        return matchesSearch && saleDate >= startDate && saleDate <= endDate;
      }
    });
    setFilteredSales(filtered);
  };

  /**
   * Handler for date range changes
   * Updates the start and end dates and filters sales accordingly
   */
  const handleDateChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    
    if (start && end) {
      // Filter sales within the new date range
      const filtered = sales.filter(sale => {
        const saleDate = new Date(sale.deliveryDate);
        return saleDate >= start && saleDate <= end;
      });
      setFilteredSales(filtered);
    } else {
      // If dates are not set, show all sales
      setFilteredSales(sales);
    }
  };

  /**
   * Handler to update a sale
   * Makes an API call to update the sale in the backend and updates the state accordingly
   */
  const handleSaleUpdate = async (updatedSale) => {
    try {
      console.log('App: Starting sale update:', updatedSale);
      
      if (!updatedSale.id) {
        throw new Error('Sale ID is required for update');
      }

      // Format the data before sending
      const formattedSale = {
        ...updatedSale,
        delivered: Boolean(updatedSale.delivered),
        deliveryDate: new Date(updatedSale.deliveryDate).toISOString().split('T')[0]
      };

      const response = await axios.put(
        `${API_BASE_URL}/sales/${updatedSale.id}`,
        formattedSale,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('App: Server response:', response);

      if (response.status === 200) {
        // Update all relevant state
        setSales(prevSales => 
          prevSales.map(sale => 
            sale.id === updatedSale.id ? response.data : sale
          )
        );
        
        // Update filtered sales if they exist
        if (filteredSales) {
          setFilteredSales(prevFiltered => 
            prevFiltered.map(sale => 
              sale.id === updatedSale.id ? response.data : sale
            )
          );
        }
        
        // Trigger a refresh of the pending sales if needed
        if (response.data.delivered !== updatedSale.delivered) {
          // Optional: Emit an event for components that need to refresh
          window.dispatchEvent(new CustomEvent('salesUpdated'));
        }
        
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('App: Error updating sale:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  };

  /**
   * Handler for toggling the archive search
   * Updates the searchArchive state and refilters the sales if a search term is present
   */
  const handleArchiveToggle = (e) => {
    const isChecked = e.target.checked;
    setSearchArchive(isChecked);
    
    if (searchTerm) {
      const filtered = sales.filter(sale => {
        const matchesSearch = Object.values(sale).some(value => 
          String(value).toLowerCase().includes(searchTerm)
        );
        
        if (isChecked) {
          // Include all matching sales if archive search is enabled
          return matchesSearch;
        } else {
          // Otherwise, include only sales within the date range
          const saleDate = new Date(sale.deliveryDate);
          return matchesSearch && saleDate >= startDate && saleDate <= endDate;
        }
      });
      setFilteredSales(filtered);
    }
  };

  const handleToggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleSaleDelete = async (saleToDelete) => {
    try {
      console.log('Attempting to delete sale:', saleToDelete.id);
      console.log('API URL:', `${API_BASE_URL}/sales/${saleToDelete.id}`);
      
      const response = await axios.delete(
        `${API_BASE_URL}/sales/${saleToDelete.id}`,
        {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true
        }
      );

      if (response.status === 200) {
        setSales(prevSales => 
          prevSales.filter(sale => sale.id !== saleToDelete.id)
        );
        if (filteredSales) {
          setFilteredSales(prevFiltered =>
            prevFiltered.filter(sale => sale.id !== saleToDelete.id)
          );
        }
        alert('Sale deleted successfully');
      }
    } catch (error) {
      console.error('Delete error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      alert(`Error deleting sale: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <Router>
      <div className={`app-container ${isDarkMode ? 'night-mode' : ''}`}>
        <NavbarComponent isDarkMode={isDarkMode} onToggleTheme={handleToggleTheme} />
        {loading && <p>Loading sales data...</p>}
        {error && <p className="error-message">{error}</p>}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/inbound" element={
            <PrivateRoute>
              <Inbound handleSaleUpdate={handleSaleUpdate} />
            </PrivateRoute>
          } />
          <Route path="/add-sale" element={
            <PrivateRoute>
              <AddNewSale />
            </PrivateRoute>
          } />
          <Route path="/admin" element={
            <PrivateRoute roles={['Admin']}>
              <AdminDashboard />
            </PrivateRoute>
          } />
          <Route path="/" element={
            <PrivateRoute>
              <>
                <ViewToggleBar />
                <div className="search-date-container">
                  <div className="search-bar">
                    {/* Search icon SVG */}
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                      type="text"
                      placeholder="Search sales..."
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                  </div>
                  <DateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    onDateChange={handleDateChange}
                  />
                  <div className="archive-toggle">
                    <label>
                      <input
                        type="checkbox"
                        checked={searchArchive}
                        onChange={handleArchiveToggle}
                      />
                      Search Archive
                    </label>
                  </div>
                </div>
                <div className="zoom-125">
                  <ChipTable sales={filteredSales || sales} onEdit={setEditingSale} />
                </div>
              </>
            </PrivateRoute>
          } />
          <Route path="/sales-table" element={
            <PrivateRoute>
              <>
                <ViewToggleBar />
                <div className="search-date-container">
                  <div className="search-bar">
                    {/* Search icon SVG */}
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                      type="text"
                      placeholder="Search sales..."
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                  </div>
                  <DateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    onDateChange={handleDateChange}
                  />
                  <div className="archive-toggle">
                    <label>
                      <input
                        type="checkbox"
                        checked={searchArchive}
                        onChange={handleArchiveToggle}
                      />
                      Search Archive
                    </label>
                  </div>
                </div>
                <SalesTable 
                  sales={filteredSales || sales} 
                  onEdit={setEditingSale} 
                  onDelete={handleSaleDelete}
                />
              </>
            </PrivateRoute>
          } />
          <Route 
            path="/change-password" 
            element={
              <PrivateRoute>
                <ChangePasswordForm />
              </PrivateRoute>
            } 
          />
          <Route path="/salesperson-dashboard" element={
            <PrivateRoute>
              <SalespersonDashboard />
            </PrivateRoute>
          } />
          <Route path="/salesperson-dashboard/:advisorId?" element={
            <PrivateRoute>
              <ViewToggleBar />
              <SalespersonDashboard />
            </PrivateRoute>
          } />
        </Routes>

        {editingSale && (
          <EditSaleForm
            sale={editingSale}
            onSubmit={handleSaleUpdate}
            onCancel={() => setEditingSale(null)}
            onDelete={handleSaleDelete}
          />
        )}
      </div>
    </Router>
  );
}

export default App;
