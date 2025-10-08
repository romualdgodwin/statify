// client/src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { Plop } from "./pages/Plop";
import { Users } from "./pages/Users";
import { CreateUser } from "./pages/CreateUser";
import { Login } from "./pages/Login";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import SpotifyCallback from "./pages/SpotifyCallback"; 
import { MonCompte } from "./pages/MonCompte"; // ✅ Import de la page MonCompte

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />

            {/* ✅ Routes protégées */}
            <Route
              path="/plop"
              element={
                <ProtectedRoute>
                  <Plop />
                </ProtectedRoute>
              }
            />

            <Route
              path="/mon-compte"
              element={
                <ProtectedRoute>
                  <MonCompte />
                </ProtectedRoute>
              }
            />

            {/* ✅ Routes publiques */}
            <Route path="/users" element={<Users />} />
            <Route path="/createUser" element={<CreateUser />} />
            <Route path="/login" element={<Login />} />
            <Route path="/spotify-callback" element={<SpotifyCallback />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
