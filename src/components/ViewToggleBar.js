import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './ViewToggleBar.css';

const ViewToggleBar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 480);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 480;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const mobileMenuClass = isMobile 
    ? (isMobileMenuOpen ? 'mobile-menu-expanded' : 'mobile-menu-collapsed')
    : '';

  return (
    <div className={`view-toggle-bar ${mobileMenuClass}`}>
      {isMobile && (
        <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? 'Hide Menu ▲' : 'View Options ▼'}
        </button>
      )}
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