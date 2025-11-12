import { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";


type ProtectedRouteProps = PropsWithChildren & {
  role?: "user" | "admin"; // rôle requis 
};

export const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const { token, role: userRole } = useAuth();

  const isLoggedIn = Boolean(token);

  //  Non connecté → redirection vers la page de connexion
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  //  Connecté mais rôle insuffisant → redirection par défaut
  if (role && userRole !== role) {
    return <Navigate to="/mon-compte" replace />;
  }

  // ✅ Accès autorisé
  return <>{children}</>;
};
