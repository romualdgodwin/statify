import { PropsWithChildren } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

type ProtectedRouteProps = PropsWithChildren & {
  role?: "user" | "admin"; // rôle requis (optionnel)
};

export const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const { token, role: userRole } = useAuth();

  // On se base uniquement sur le JWT interne
  const isLoggedIn = Boolean(token);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (role && userRole !== role) {
    // 🔒 Redirige si l'utilisateur n'a pas le bon rôle
    return <Navigate to="/mon-compte" replace />;
  }

  return <>{children}</>;
};
