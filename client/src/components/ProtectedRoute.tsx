import { PropsWithChildren } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }: PropsWithChildren) => {
  const { token } = useAuth();

  // Si pas de token, redirige vers /login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
