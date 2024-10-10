import React, { useState } from 'react';
import './SalesTable.css';

function SalesTable({ sales, onEdit, onDelete }) {
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({});

  const handleSort = (column) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleFilter = (column, value) => {
    setFilters(prev => ({ ...prev, [column]: value }));
  };

  const filteredSales = sales.filter(sale => {
    return Object.entries(filters).every(([column, value]) => {
      if (!value) return true;
      const saleValue = sale[column];
      return saleValue != null && saleValue.toString().toLowerCase().includes(value.toLowerCase());
    });
  });

  const sortedSales = [...filteredSales].sort((a, b) => {
    if (!sortColumn) return 0;
    
    let valueA = a[sortColumn];
    let valueB = b[sortColumn];

    if (typeof valueA === 'string') valueA = valueA.toLowerCase();
    if (typeof valueB === 'string') valueB = valueB.toLowerCase();

    if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const columns = [
    { key: 'stockNumber', label: 'Stock #' },
    { key: 'clientName', label: 'Client Name' },
    { key: 'year', label: 'Year' },
    { key: 'make', label: 'Make' },
    { key: 'model', label: 'Model' },
    { key: 'color', label: 'Color' },
    { key: 'advisor', label: 'Advisor' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'deliveryDate', label: 'Delivery Date' },
    { key: 'type', label: 'Type' }
  ];

  return (
    <div className="sales-table">
      <table>
        <thead>
          <tr>
            {columns.map(column => (
              <th key={column.key} className={`column-${column.key}`}>
                <div className="th-content">
                  <span onClick={() => handleSort(column.key)}>
                    {column.label}
                    {sortColumn === column.key && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                  </span>
                  <input
                    type="text"
                    onChange={(e) => handleFilter(column.key, e.target.value)}
                    placeholder={column.label}
                  />
                </div>
              </th>
            ))}
            <th className="column-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedSales.map(sale => (
            <tr key={sale.id}>
              {columns.map(column => (
                <td key={column.key} className={`column-${column.key}`}>
                  {column.key === 'delivered' 
                    ? (sale[column.key] ? 'Yes' : 'No')
                    : column.key === 'deliveryDate'
                    ? new Date(sale[column.key]).toLocaleDateString()
                    : sale[column.key]}
                </td>
              ))}
              <td className="column-actions">
                <button onClick={() => onEdit(sale)}>Edit</button>
                <button onClick={() => onDelete(sale.id)} disabled={sale.delivered}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SalesTable;
