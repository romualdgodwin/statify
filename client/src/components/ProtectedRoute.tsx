import { PropsWithChildren } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

type ProtectedRouteProps = PropsWithChildren & {
  role?: "user" | "admin"; // rôle requis (optionnel)
};

export const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const { token, spotifyAccessToken, role: userRole } = useAuth();

  // Pas connecté → redirection login
  if (!token && !spotifyAccessToken) {
    return <Navigate to="/login" replace />;
  }

  // Si un rôle est requis et que celui de l’utilisateur ne correspond pas → accès interdit
  if (role && userRole !== role) {
    return <Navigate to="/" replace />; // ou une page "403 - Accès interdit"
  }

  return children;
};
