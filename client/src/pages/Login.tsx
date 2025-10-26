import { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Connexion classique (email/password)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await axios.post("http://localhost:3000/auth/login", {
        email,
        password,
      });

      // ✅ Ici on n’a PAS de Spotify token → on passe null
      login(res.data.token, null, null, res.data.role);

      setSuccess("Connexion réussie 🎉 Redirection...");

      // ✅ Redirection selon rôle
      setTimeout(() => {
        if (res.data.role === "admin") {
          navigate("/admin-dashboard"); // 👉 tableau de bord admin
        } else {
          navigate("/spotify-dashboard"); // 👉 tableau de bord user
        }
      }, 1500);
    } catch (err) {
      console.error("❌ Erreur de connexion :", err);
      setError("Échec de la connexion ❌ Vérifie ton email/mot de passe");
    }
  };

  // Connexion via Spotify → redirection backend
  const handleSpotifyLogin = () => {
    window.location.href = "http://localhost:3000/spotify/login";
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
        <Button
          variant="success"
          className="w-100"
          onClick={handleSpotifyLogin}
        >
          🎵 Se connecter avec Spotify
        </Button>
      </div>
    </div>
  );
};
