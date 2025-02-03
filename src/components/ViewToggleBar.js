import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './ViewToggleBar.css';

const ViewToggleBar = () => {
  const location = useLocation();

  return (
    <div className="view-toggle-bar">
      <div className="left-buttons">
        <Link to="/" className={location.pathname === '/' ? 'view-button active' : 'view-button'}>
          Chip View
        </Link>
        <Link to="/sales-table" className={location.pathname === '/sales-table' ? 'view-button active' : 'view-button'}>
          List View
        </Link>
        <Link to="/inbound" className={location.pathname === '/inbound' ? 'view-button active' : 'view-button'}>
          Inbound
        </Link>
        <Link to="/salesperson-dashboard" className={location.pathname === '/salesperson-dashboard' ? 'view-button active' : 'view-button'}>
          Dashboard
        </Link>
        <Link to="/unified-search" className={location.pathname === '/unified-search' ? 'view-button active' : 'view-button'}>
          Vehicle Search
        </Link>
      </div>
      <div className="right-buttons">
        <Link to="/add-sale" className={location.pathname === '/add-sale' ? 'view-button active' : 'view-button'}>
          Add New Sale
        </Link>
      </div>
    </div>
  );
};

export default ViewToggleBar; 