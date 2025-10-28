import { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";             // axios centralisé
import { saveAuthLogin } from "../services/auth"; // sauvegarde token

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Connexion classique
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await api.post("/auth/login", { email, password });

      if (!res.data?.token) {
        setError("Réponse invalide du serveur 🚨");
        return;
      }

      // ✅ Sauvegarde et mise à jour du contexte
      saveAuthLogin(res.data.token);
      login(res.data.token, null, null, res.data.role ?? null);

      setSuccess("Connexion réussie 🎉 Redirection...");

      // ✅ Redirection selon rôle
      setTimeout(() => {
        navigate(res.data.role === "admin" ? "/admin-dashboard" : "/spotify-dashboard");
      }, 1200);
    } catch (err: any) {
      console.error("❌ Erreur de connexion :", err.response?.data || err.message);
      setError("Échec de la connexion ❌ Vérifie ton email/mot de passe");
    }
  };

  // Connexion Spotify → redirection backend
  const handleSpotifyLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/spotify/login`;
    // ⚠️ ça lit ton .env (ex: VITE_API_URL=http://localhost:3000)
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        minHeight: "80vh",
        padding: "1rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <h1 className="text-center mb-4">Connexion</h1>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {/* === Formulaire classique === */}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Entre ton email"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Mot de passe</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              required
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100 mb-3">
            Se connecter
          </Button>
        </Form>

        <hr />

        {/* === Connexion Spotify === */}
        <Button variant="success" className="w-100" onClick={handleSpotifyLogin}>
          🎵 Se connecter avec Spotify
        </Button>
      </div>
    </div>
  );
};
