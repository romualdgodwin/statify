import { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * 🔒 ProtectedRoute
 * - Protège une route selon l'authentification et, optionnellement, un rôle.
 * - Si l'utilisateur n'est pas connecté → redirection vers /login.
 * - Si le rôle ne correspond pas → redirection vers /mon-compte (ou une page d’erreur dédiée).
 */
type ProtectedRouteProps = PropsWithChildren & {
  role?: "user" | "admin"; // rôle requis (optionnel)
};

export const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const { token, role: userRole } = useAuth();

  const isLoggedIn = Boolean(token);

  // 🧭 Non connecté → redirection vers la page de connexion
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // 🚫 Connecté mais rôle insuffisant → redirection par défaut
  if (role && userRole !== role) {
    // Tu pourrais rediriger vers une page 403 personnalisée ici :
    // return <Navigate to="/forbidden" replace />;
    return <Navigate to="/mon-compte" replace />;
  }

  // ✅ Accès autorisé
  return <>{children}</>;
};
