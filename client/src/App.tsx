import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Users } from "./pages/Users";
import { CreateUser } from "./pages/CreateUser";
import { Login } from "./pages/Login";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import SpotifyCallback from "./pages/SpotifyCallback";
import { MonCompte } from "./pages/MonCompte"; 
import { SpotifyDashboard } from "./pages/SpotifyDashboard"; 
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            
            {/* ✅ Dashboard utilisateur */}
            <Route
              path="/spotify-dashboard"
              element={
                <ProtectedRoute role="user">
                  <SpotifyDashboard />
                </ProtectedRoute>
              }
            />

            {/* ✅ Mon Compte */}
            <Route
              path="/mon-compte"
              element={
                <ProtectedRoute>
                  <MonCompte />
                </ProtectedRoute>
              }
            />

            {/* ✅ Admin */}
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
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* ✅ Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/spotify-callback" element={<SpotifyCallback />} />

            {/* ✅ Catch-all */}
            <Route path="*" element={<Login />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
