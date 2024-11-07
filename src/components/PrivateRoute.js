import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './PrivateRoute.css';

function PrivateRoute({ children }) {
  const { auth } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking auth state
    const checkAuth = () => {
      setTimeout(() => {
        setLoading(false);
      }, 500); // Small delay to prevent flash
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!auth || !auth.user) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default PrivateRoute; 