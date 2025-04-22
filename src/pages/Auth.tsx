
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

// Auth page is now just a redirect to the login route
const Auth = () => {
  const location = useLocation();
  
  // If we're already at /auth, redirect to /auth/login
  if (location.pathname === "/auth") {
    return <Navigate to="/auth/login" replace />;
  }
  
  return null;
};

export default Auth;
