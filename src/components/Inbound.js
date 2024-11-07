import React, { useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { format, addMonths } from 'date-fns';
import { AuthContext } from '../contexts/AuthContext';
import InboundUnit from './InboundUnit';
import EditSaleForm from './EditSaleForm';
import './Inbound.css';
import ViewToggleBar from './ViewToggleBar';

/**
 * Inbound Component
 * 
 * This component displays pending sales grouped by advisors and organized by delivery month.
 * It includes functionalities to edit sales and ensures consistent UI with other pages by incorporating
 * the ViewToggleBar for view selection.
 */
const Inbound = () => {
  // Remove unused API_BASE_URL constant since process.env.REACT_APP_API_BASE_URL is used instead
  
  // State to hold pending sales data
  const [pendingSales, setPendingSales] = useState([]);
  
  // State to hold the list of upcoming months
  const [months, setMonths] = useState([]);
  
  // State to control the visibility of the edit form
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  
  // State to hold the sale currently being edited
  const [editingSale, setEditingSale] = useState(null);
  
  // Accessing authentication information from AuthContext
  const { auth } = useContext(AuthContext);
  
  // State to manage the current view mode ('chip' or 'list')
  const [currentView, setCurrentView] = useState('chip');

  /**
   * Fetches pending sales data from the backend API.
   */
  const fetchPendingSales = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/sales/pending-sales`, {
        headers: {
          'Authorization': `Bearer ${auth.token}`
        }
      });
      setPendingSales(response.data);
    } catch (error) {
      console.error('Error fetching pending sales:', error);
    }
  }, [auth.token]);

  /**
   * Generates the next four months for organizing sales data.
   */
  const generateMonths = () => {
    const today = new Date();
    const nextFourMonths = Array.from({ length: 4 }, (_, i) => 
      format(addMonths(today, i + 1), 'MMMM yyyy')
    );
    setMonths(nextFourMonths);
  };

  /**
   * useEffect hook to fetch pending sales and generate months on component mount.
   */
  useEffect(() => {
    fetchPendingSales();
    generateMonths();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Groups sales by advisor.
   * 
   * @param {Array} sales - The array of sales to group.
   * @returns {Object} - An object with advisor names as keys and arrays of sales as values.
   */
  const groupSalesByAdvisor = (sales) => {
    return sales.reduce((acc, sale) => {
      if (!acc[sale.advisor]) {
        acc[sale.advisor] = [];
      }
      acc[sale.advisor].push(sale);
      return acc;
    }, {});
  };

  // Grouping the pending sales by advisor
  const groupedSales = groupSalesByAdvisor(pendingSales);

  /**
   * Sorts advisors based on the number of sales in the upcoming months.
   */
  const sortedAdvisors = Object.entries(groupedSales)
    .filter(([_, sales]) => 
      sales.some(sale => 
        months.includes(format(new Date(sale.deliveryDate), 'MMMM yyyy'))
      )
    )
    .sort(([_, salesA], [__, salesB]) => salesB.length - salesA.length)
    .map(([advisor]) => advisor);

  /**
   * Handles the edit action by opening the edit form with the selected sale.
   * 
   * @param {Object} sale - The sale object to be edited.
   */
  const onEdit = (sale) => {
    setEditingSale(sale);
    setIsEditFormOpen(true);
  };

  /**
   * Handles the submission of the edited sale.
   * 
   * @param {Object} updatedSale - The updated sale data.
   */
  const handleEditSubmit = (updatedSale) => {
    // Implement the logic to update the sale in the backend
    // For example, make an API call to update the sale
    // After successful update, refresh the pending sales
    setIsEditFormOpen(false);
    setEditingSale(null);
    fetchPendingSales();
  };

  /**
   * Handles the cancellation of the edit form.
   */
  const handleEditCancel = () => {
    console.log('Cancel clicked');
    setIsEditFormOpen(false);
    setEditingSale(null);
  };

  return (
    <div className="inbound-container">
      {/* Include the ViewToggleBar for consistent view selection */}
      <ViewToggleBar 
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      {/* Add conditional rendering based on currentView */}
      {currentView === 'chip' ? (
        <div className="inbound-grid">
          {/* Header row with consultant and month headers */}
          <div className="header-row">
            <div className="consultant-header">Consultant</div>
            {months.map(month => (
              <div key={month} className="month-header">{month}</div>
            ))}
          </div>
          {/* Iterate over sorted advisors to display their sales */}
          {sortedAdvisors.map(advisor => (
            <div key={advisor} className="advisor-row">
              <div className="advisor-name">{advisor}</div>
              {months.map(month => (
                <div key={month} className="month-cell">
                  {groupedSales[advisor]
                    .filter(sale => 
                      format(new Date(sale.deliveryDate), 'MMMM yyyy') === month
                    )
                    .map(sale => (
                      <InboundUnit
                        key={sale.id}
                        sale={sale}
                        onEdit={onEdit}
                      />
                    ))
                  }
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="inbound-list">
          {/* implement list view */}
        </div>
      )}

      {/* Render the EditSaleForm if a sale is being edited */}
      {isEditFormOpen && editingSale && (
        <EditSaleForm
          sale={editingSale}
          onSubmit={handleEditSubmit}
          onCancel={handleEditCancel}
        />
      )}
    </div>
  );
};

export default Inbound;
