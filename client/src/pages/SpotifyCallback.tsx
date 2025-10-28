import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { saveSpotifyLogin } from "../services/auth"; // ✅ important

export default function SpotifyCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const appToken = params.get("appToken");
    const spotifyAccessToken = params.get("spotifyAccessToken");
    const spotifyRefreshToken = params.get("spotifyRefreshToken");

    if (appToken && spotifyAccessToken && spotifyRefreshToken) {
      // ✅ Sauvegarde dans localStorage
      saveSpotifyLogin(appToken, spotifyAccessToken, spotifyRefreshToken);

      // ✅ Mise à jour du contexte React
      login(appToken, spotifyAccessToken, spotifyRefreshToken);

      // Redirection vers dashboard Spotify
      navigate("/spotify-dashboard");
    } else {
      // ⚠️ Pas de token → retour login
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
