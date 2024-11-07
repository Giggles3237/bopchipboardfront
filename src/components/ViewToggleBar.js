import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './ViewToggleBar.css';

const ViewToggleBar = () => {
  const location = useLocation();

  const getButtonClass = (path) => {
    if (path === 'chip' && location.pathname === '/') return 'view-button active';
    if (path === 'list' && location.pathname === '/sales-table') return 'view-button active';
    if (path === 'inbound' && location.pathname === '/inbound') return 'view-button active';
    if (path === 'add-sale' && location.pathname === '/add-sale') return 'view-button active';
    return 'view-button';
  };

  return (
    <div className="view-toggle-bar">
      <div className="left-buttons">
        <Link to="/" className={getButtonClass('chip')}>
          Chip View
        </Link>
        <Link to="/sales-table" className={getButtonClass('list')}>
          List View
        </Link>
        <Link to="/inbound" className={getButtonClass('inbound')}>
          Inbound
        </Link>
      </div>
      <div className="right-buttons">
        <Link to="/add-sale" className={getButtonClass('add-sale')}>
          Add New Sale
        </Link>
      </div>
    </div>
  );
};

export default ViewToggleBar; 