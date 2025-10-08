// client/src/pages/SpotifyCallback.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function SpotifyCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const appToken = params.get("appToken");
    const spotifyAccessToken = params.get("spotifyAccessToken");
    const spotifyRefreshToken = params.get("spotifyRefreshToken");

    if (appToken && spotifyAccessToken && spotifyRefreshToken) {
      // ✅ Enregistre les tokens dans le AuthContext + localStorage
      login(appToken, spotifyAccessToken, spotifyRefreshToken);

      // ✅ Redirection après enregistrement
      setTimeout(() => {
        navigate("/dashboard"); // ✅ redirection vers Dashboard
      }, 500);
    } else {
      // ❌ Tokens manquants → retour à la page login
      navigate("/login");
    }
  }, [login, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h2>Connexion en cours avec Spotify...</h2>
      <p>Veuillez patienter 🔄</p>
    </div>
  );
}
