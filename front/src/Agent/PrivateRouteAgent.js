import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRouteAgent = () => {
  const agentId = localStorage.getItem("agentId");

  return agentId ? <Outlet /> : <Navigate to="/agentLogin" />;
};

export default PrivateRouteAgent;
