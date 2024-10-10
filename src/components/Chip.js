import React, { useState } from 'react';
import './Chip.css';

function Chip({ sale, onEdit }) {
  const [isHovered, setIsHovered] = useState(false);

  if (!sale) {
    return null;
  }

  const getChipClass = () => {
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
  };

  // Check if the unit is delivered or pending (1 for delivered, 0 for pending)
  const isDelivered = sale.delivered === 1;
  const chipClass = `chip ${getChipClass()} ${isDelivered ? 'delivered' : 'pending'}`;

  const isCPO = sale.type === 'CPO BMW' || sale.type === 'CPO MINI';

  const handleClick = () => {
    onEdit(sale);
  };

  return (
    <div 
      className={chipClass}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <span className="stock-number">
        {sale.stockNumber}
        {isCPO && <span className="gold-star">★</span>}
      </span>
      {isHovered && (
        <div className="hover-info">
          <p>{`${sale.color} ${sale.year} ${sale.make} ${sale.model}`}</p>
          <p>{sale.clientName}</p>
        </div>
      )}
    </div>
  );
}

export default Chip;
