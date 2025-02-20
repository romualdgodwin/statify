import { PropsWithChildren } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Login } from "../pages/Login";

export const ProtectedRoute = ({ children }: PropsWithChildren) => {
  const { token } = useAuth();

  return token ? children : <Login />;
};
