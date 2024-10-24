import React from 'react';
import './InboundUnit.css';

const InboundUnit = ({ sale, onEdit }) => {
  const unitClass = sale.type.includes('BMW') ? 'bmw-unit' : 'mini-unit';
  const isCPO = sale.type === 'CPO BMW' || sale.type === 'CPO MINI';

  const handleClick = () => {
    onEdit(sale);
  };

  const getLastName = (fullName) => {
    const nameParts = fullName.split(' ');
    return nameParts[nameParts.length - 1];
  };

  return (
    <div 
      className={`inbound-unit ${unitClass}`}
      onClick={handleClick}
    >
      <span className="client-name">
        {getLastName(sale.clientName)}
        {isCPO && <span className="gold-star">★</span>}
      </span>
    </div>
  );
};

export default InboundUnit;
