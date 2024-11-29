import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import './SalesTable.css';
import ReactPaginate from 'react-paginate';

/**
 * SalesTable Component
 * 
 * Displays a table of sales with functionalities to sort, filter, edit, and delete sales.
 * It also shows aggregated totals for managers and administrators.
 *
 * @param {Array} sales - List of sales to display.
 * @param {Function} onEdit - Callback function to handle editing a sale.
 * @param {Function} onDelete - Callback function to handle deleting a sale.
 */
function SalesTable({ sales, onEdit, onDelete }) {
  const { auth } = useContext(AuthContext);
  const isManagerOrAdmin = auth?.user?.role === 'Manager' || auth?.user?.role === 'Admin';
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(25);
  const [filters, setFilters] = useState({
    stockNumber: '',
    clientName: '',
    year: '',
    make: '',
    model: '',
    color: '',
    advisor: '',
    delivered: '',
    deliveryDate: '',
    type: ''
  });

  const handleFilterChange = (column, value) => {
    setFilters(prev => ({
      ...prev,
      [column]: value
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleRowClick = (sale) => {
    onEdit(sale);
  };

  const handleDelete = (e, sale) => {
    e.stopPropagation(); // Prevent row click event
    if (window.confirm('Are you sure you want to delete this sale?')) {
      onDelete(sale);
    }
  };

  // Text formatting functions
  const formatClientName = (name, advisor) => {
    if (!name) return '';
    
    // Show client name only if user is manager/admin or if the sale belongs to the current user
    if (!auth?.user?.role === 'Admin' && advisor !== auth?.user?.name) {
      return '***';
    }

    const names = name.toLowerCase().split(' ');
    if (names.length >= 2) {
      const firstName = names[0].charAt(0).toUpperCase() + names[0].slice(1);
      const lastInitial = names[names.length - 1].charAt(0).toUpperCase();
      return `${firstName} ${lastInitial}.`;
    }
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const formatStockNumber = (stock) => {
    if (!stock) return '';
    if (stock.toLowerCase().includes('incoming')) {
      return 'Incoming' + stock.slice(8).toUpperCase();
    }
    return stock.toUpperCase();
  };

  const formatMake = (make) => {
    if (!make) return '';
    const upperMake = make.toUpperCase();
    if (upperMake.includes('BMW')) return 'BMW';
    if (upperMake.includes('MINI')) return 'MINI';
    return make
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatProperCase = (text) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getFilteredData = () => {
    return sales.filter(sale => {
      return Object.keys(filters).every(key => {
        const filterValue = filters[key].toLowerCase();
        if (!filterValue) return true; // Skip empty filters
        
        let saleValue = String(sale[key] || '').toLowerCase();
        
        // Special handling for dates
        if (key === 'deliveryDate' && sale[key]) {
          saleValue = new Date(sale[key]).toLocaleDateString();
        }
        
        // Special handling for delivered status
        if (key === 'delivered') {
          saleValue = sale[key] ? 'yes' : 'no';
        }
        
        return saleValue.includes(filterValue);
      });
    });
  };

  // Get current rows
  const filteredData = getFilteredData();
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);

  // Calculate total pages
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const handlePageChange = (selectedItem) => {
    setCurrentPage(selectedItem.selected + 1);
  };

  return (
    <div className="sales-table-container">
      <div className="filtered-results">
        Showing {filteredData.length} of {sales.length} total sales
      </div>
      <table className="sales-table">
        <thead>
          <tr>
            {Object.keys(filters).map(column => (
              <th key={column} className={`column-${column}`}>
                <div className="th-content">
                  <div>{column.charAt(0).toUpperCase() + column.slice(1)}</div>
                  <input
                    type="text"
                    value={filters[column]}
                    onChange={(e) => handleFilterChange(column, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder={`Filter ${column}`}
                  />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentRows.map((sale) => (
            <tr 
              key={sale.id} 
              onClick={() => handleRowClick(sale)}
              className="clickable-row"
            >
              <td>{formatStockNumber(sale.stockNumber)}</td>
              <td>{formatClientName(sale.clientName, sale.advisor)}</td>
              <td>{sale.year}</td>
              <td>{formatMake(sale.make)}</td>
              <td>{formatProperCase(sale.model)}</td>
              <td>{formatProperCase(sale.color)}</td>
              <td>{formatProperCase(sale.advisor)}</td>
              <td>
                <span className={`status-badge ${sale.delivered ? 'completed' : 'pending'}`}>
                  {sale.delivered ? 'Yes' : 'No'}
                </span>
              </td>
              <td>{sale.deliveryDate ? new Date(sale.deliveryDate).toLocaleDateString() : '-'}</td>
              <td>{sale.type}</td>
              {isManagerOrAdmin && (
                <td className="actions-cell">
                  <button 
                    className="delete-button"
                    onClick={(e) => handleDelete(e, sale)}
                    title="Delete Sale"
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <ReactPaginate
        previousLabel="Previous"
        nextLabel="Next"
        breakLabel="..."
        pageCount={totalPages}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={handlePageChange}
        containerClassName="pagination"
        pageClassName="pagination-item"
        pageLinkClassName="pagination-link"
        previousClassName="pagination-item"
        previousLinkClassName="pagination-link"
        nextClassName="pagination-item"
        nextLinkClassName="pagination-link"
        breakClassName="pagination-item"
        breakLinkClassName="pagination-link"
        activeClassName="active"
        forcePage={currentPage - 1}
      />
    </div>
  );
}

export default SalesTable;
