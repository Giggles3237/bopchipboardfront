import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children, roles }) {
  const { auth } = useContext(AuthContext);

  if (!auth.user) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(auth.user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}

export default PrivateRoute; 