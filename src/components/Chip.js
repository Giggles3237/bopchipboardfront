import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import './Chip.css';

function Chip({ sale, onEdit, isEditable }) {
  const [isHovered, setIsHovered] = useState(false);
  const { auth } = useContext(AuthContext);
  const isManagerOrAdmin = auth?.user?.role === 'Admin' || auth?.user?.role === 'Manager';

  if (!sale) {
    return null;
  }

  const getChipClass = () => {
    const baseClass = (() => {
      switch (sale.type) {
        case 'New BMW':
          return 'new-bmw';
        case 'New MINI':
          return 'new-mini';
        case 'CPO BMW':
        case 'CPO MINI':
        case 'Used BMW':
        case 'Used MINI':
          return 'used-cpo';
        default:
          return 'default';
      }
    })();

    return `chip-component ${baseClass} ${sale.delivered ? 'delivered' : 'pending'}`;
  };

  const formatClientName = (name) => {
    if (!name) return '';
    if (!isManagerOrAdmin && sale.advisor !== auth?.user?.name) {
      return '***';
    }
    return name;
  };

  return (
    <div 
      className={`chip-component ${getChipClass()}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={isEditable ? () => onEdit(sale) : undefined}
    >
      <span className="stock-number">
        {sale.stockNumber}
        {(sale.type === 'CPO BMW' || sale.type === 'CPO MINI') && <span className="gold-star">★</span>}
      </span>
      {isHovered && (
        <div className="hover-info">
          <p>{`${sale.color} ${sale.year} ${sale.make} ${sale.model}`}</p>
          <p>{formatClientName(sale.clientName)}</p>
        </div>
      )}
    </div>
  );
}

export default Chip;
