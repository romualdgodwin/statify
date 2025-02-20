import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { Plop } from "./pages/Plop";
import { Users } from "./pages/Users";
import { CreateUser } from "./pages/CreateUser";
import { Login } from "./pages/Login";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/plop"
            element={
              <ProtectedRoute>
                <Plop />
              </ProtectedRoute>
            }
          />
          <Route path="/users" element={<Users />} />
          <Route path="/createUser" element={<CreateUser />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
