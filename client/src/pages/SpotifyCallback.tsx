// client/src/pages/SpotifyCallback.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function SpotifyCallback() {
  const navigate = useNavigate();
  const { login, token } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const appToken = params.get("appToken");
    const spotifyAccessToken = params.get("spotifyAccessToken");
    const spotifyRefreshToken = params.get("spotifyRefreshToken");

    if (!token && appToken && spotifyAccessToken && spotifyRefreshToken) {
      // ✅ Login via Spotify → on stocke tout
      login(appToken, spotifyAccessToken, spotifyRefreshToken, "user");

      // Redirection vers dashboard Spotify
      navigate("/spotify-dashboard");
    } else if (!appToken) {
      // ⚠️ Pas de token → retour login
      navigate("/login");
    }
  }, [login, navigate]); // pas besoin de `token` en dépendance

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h2>Connexion en cours avec Spotify...</h2>
      <p>Veuillez patienter 🔄</p>
    </div>
  );
}
