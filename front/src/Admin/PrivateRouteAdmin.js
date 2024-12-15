import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRouteAdmin = ({ children }) => {
  const adminId = localStorage.getItem("adminId");
  const expirationTime = localStorage.getItem("adminExpiration");

  // Check if the expiration time is reached
  if (!adminId || (expirationTime && new Date().getTime() > expirationTime)) {
    localStorage.removeItem("adminId");
    localStorage.removeItem("adminExpiration");
    return <Navigate to="/admin/login" />;
  }

  return children;
};

export default PrivateRouteAdmin;
