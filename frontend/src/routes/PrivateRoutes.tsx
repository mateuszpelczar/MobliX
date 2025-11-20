import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
}

type JwtPayload = {
  sub: string;
  role: string;
  exp: number;
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  requiredRole,
}) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode<JwtPayload>(token);

    if (requiredRole) {
      // Jeśli requiredRole to tablica, sprawdź czy rola użytkownika jest w tablicy
      if (Array.isArray(requiredRole)) {
        if (!requiredRole.includes(decoded.role)) {
          return <Navigate to="/unauthorized" replace />;
        }
      } else {
        // Jeśli requiredRole to string, sprawdź czy pasuje
        if (decoded.role !== requiredRole) {
          return <Navigate to="/unauthorized" replace />;
        }
      }
    }

    return <>{children}</>;
  } catch (err) {
    return <Navigate to="/login" replace />;
  }
};

export default PrivateRoute;
