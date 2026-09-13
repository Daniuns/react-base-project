import { Navigate } from "react-router";

import { ReactNode, useEffect, useState } from "react";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Simulação de verificação assíncrona
    setTimeout(() => {
      setIsAuthenticated(!!localStorage.getItem("authToken"));
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
