import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRouteMasterAdmin = ({ children }) => {
  const masterAdminId = localStorage.getItem("masterAdminId");
  const expirationTime = localStorage.getItem("masterAdminExpiration");

  // Check if the expiration time is reached
  if (
    !masterAdminId ||
    (expirationTime && new Date().getTime() > expirationTime)
  ) {
    localStorage.removeItem("masterAdminId");
    localStorage.removeItem("masterAdminExpiration");
    return <Navigate to="/masteradminlogin" />;
  }

  return children;
};

export default PrivateRouteMasterAdmin;
