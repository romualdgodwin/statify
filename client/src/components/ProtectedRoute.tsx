import { PropsWithChildren } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }: PropsWithChildren) => {
  const { token, spotifyAccessToken } = useAuth();

if (!token && !spotifyAccessToken) {
  return <Navigate to="/login" replace />;
}
  return children;
};
