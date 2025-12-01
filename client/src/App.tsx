import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";

//  Pages Utilisateurs
import { Login } from "./pages/Login";
import { MonCompte } from "./pages/MonCompte";
import { SpotifyDashboard } from "./pages/SpotifyDashboard";
import SpotifyCallback from "./pages/SpotifyCallback";

//  Pages Admin
import AdminDashboard from "./pages/AdminDashboard";
import AdminBadges from "./pages/AdminBadges";
import { Users } from "./pages/Users";
import { CreateUser } from "./pages/CreateUser";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Layout global : header + footer */}
          <Route element={<Layout />}>
            
            {/* 🎵 Utilisateur : Espace Spotify */}
            <Route
              path="/spotify-dashboard"
              element={
                <ProtectedRoute role="user">
                  <SpotifyDashboard />
                </ProtectedRoute>
              }
            />

            {/* 👤 Espace personnel */}
            <Route
              path="/mon-compte"
              element={
                <ProtectedRoute>
                  <MonCompte />
                </ProtectedRoute>
              }
            />

            {/* 🧑‍💼 Espace administrateur */}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-badges"
              element={
                <ProtectedRoute role="admin">
                  <AdminBadges />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute role="admin">
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-user"
              element={
                <ProtectedRoute role="admin">
                  <CreateUser />
                </ProtectedRoute>
              }
            />

            {/* 🔐 Authentification */}
            <Route path="/login" element={<Login />} />
            <Route path="/spotify-callback" element={<SpotifyCallback />} />

            {/* 🚧 Fallback : redirige vers login */}
            <Route path="*" element={<Login />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
