import React from "react";
import { Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

const RequireAuth = ({ children }) => {
  const { user } = useApp();
  return user ? children : <Navigate to="/login" replace />;
};

export default RequireAuth;
