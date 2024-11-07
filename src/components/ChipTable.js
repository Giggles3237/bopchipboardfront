import React, { useContext } from 'react';
import Chip from './Chip';
import './ChipTable.css';
import { AuthContext } from '../contexts/AuthContext';
import Totals from './Totals';

/**
 * ChipTable Component
 * 
 * This component displays a table of sales chips, grouped and sorted by advisors.
 * It provides functionalities to edit sales based on user roles and displays
 * aggregated sales data for managers and administrators.
 *
 * @param {Array} sales - An array of sales objects to be displayed.
 * @param {Function} onEdit - Callback function to handle editing of a sale.
 */
function ChipTable({ sales = [], onEdit }) {
  // Accessing authentication information from AuthContext
  const { auth } = useContext(AuthContext);

  // Determining if the current user has managerial or administrative privileges
  const isManagerOrAdmin = auth?.user?.role === 'Admin' || auth?.user?.role === 'Manager';

  // Debugging information: total sales, unique advisors, current user's role and name
  console.log('ChipTable Debug:', {
    totalSales: sales.length,
    uniqueAdvisors: [...new Set(sales.map(sale => sale.advisor))],
    currentUserRole: auth?.user?.role,
    currentUserName: auth?.user?.name
  });

  // Additional render-time debugging info: sales count, first sale, and user role
  console.log('ChipTable render:', {
    salesCount: sales?.length,
    firstSale: sales?.[0],
    authRole: auth?.user?.role
  });

  /**
   * Determines if the current user can edit a specific sale.
   * 
   * Admins and Managers can edit any sale.
   * Salespeople can only edit their own sales.
   *
   * @param {Object} sale - The sale object to check permissions for.
   * @returns {boolean} - True if the user can edit the sale, otherwise false.
   */
  const canEditSale = (sale) => {
    const userRole = auth?.user?.role;
    // Admins and Managers can edit any sale
    if (userRole === 'Admin' || userRole === 'Manager') {
      return true;
    }
    // Salespeople can only edit their own sales
    return sale.advisor === auth?.user?.name;
  };

  /**
   * Aggregates sales data per advisor, counting total and delivered sales.
   * 
   * @returns {Object} - An object mapping advisor names to their sales statistics.
   */
  const getAdvisorStats = () => {
    return sales.reduce((acc, sale) => {
      const advisor = sale.advisor || 'Unassigned';
      if (!acc[advisor]) {
        acc[advisor] = { total: 0, delivered: 0 };
      }
      acc[advisor].total += 1;
      if (sale.delivered) {
        acc[advisor].delivered += 1;
      }
      return acc;
    }, {});
  };

  /**
   * Formats advisor information with their delivered and pending sales statistics.
   *
   * @param {string} advisor - The name of the advisor.
   * @returns {Object} - An object containing the advisor's name, delivered, and pending sales.
   */
  const formatAdvisorWithStats = (advisor) => {
    const stats = getAdvisorStats();
    const delivered = stats[advisor].delivered;
    const pending = stats[advisor].total - delivered;
    return {
      name: advisor,
      delivered: delivered,
      pending: pending
    };
  };

  // Creating a sorted list of advisors based on their delivered and total sales
  const sortedAdvisors = [...new Set(sales.map(sale => sale.advisor || 'Unassigned'))]
    .filter(advisor => advisor !== 'Unassigned')  // Excluding 'Unassigned' advisors
    .sort((a, b) => {
      const stats = getAdvisorStats();
      // Sort by number of delivered sales in descending order
      if (stats[b].delivered !== stats[a].delivered) {
        return stats[b].delivered - stats[a].delivered;
      }
      // If delivered sales are equal, sort by total sales in descending order
      if (stats[b].total !== stats[a].total) {
        return stats[b].total - stats[a].total;
      }
      // If both delivered and total sales are equal, sort alphabetically
      return a.localeCompare(b);
    })
    .map(advisor => formatAdvisorWithStats(advisor));

  /**
   * Handler function for editing a sale.
   * 
   * Checks if the user has permission to edit the sale and invokes the onEdit callback.
   * If the user lacks permission, an alert is shown.
   *
   * @param {Object} sale - The sale object to be edited.
   */
  const handleEdit = (sale) => {
    if (canEditSale(sale)) {
      onEdit(sale);
    } else {
      alert('You can only edit your own sales.');
    }
  };

  return (
    <div className="chip-table">
      {/* Display Totals component if user is Manager or Admin */}
      {isManagerOrAdmin && <Totals sales={sales} />}
      
      {/* Iterate over sorted advisors to display their sales chips */}
      {sortedAdvisors.map(({ name, delivered, pending }) => (
        <div key={name} className="advisor-section">
          <div className="advisor-name">
            <h3>
              {name}
              <div className="advisor-stats">
                <span className="delivered">{delivered}</span>
                <span className="pending">({pending})</span>
              </div>
            </h3>
          </div>
          <div className="chips">
            {sales
              .filter(sale => sale.advisor === name)
              .sort((a, b) => {
                // First, sort by delivery status: delivered sales come first
                if (a.delivered !== b.delivered) {
                  return a.delivered ? -1 : 1;  // Delivered sales first
                }
                // Then, sort by delivery date in descending order within each group
                return new Date(b.deliveryDate) - new Date(a.deliveryDate);
              })
              .map(sale => (
                <Chip 
                  key={sale.id} 
                  sale={sale} 
                  onEdit={handleEdit}
                  isEditable={canEditSale(sale)}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ChipTable;