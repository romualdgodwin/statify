// client/src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const Dashboard = () => {
  const { token, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (token) {
          // Mode classique → appel backend /auth/me
          const res = await axios.get("http://localhost:3000/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setProfile(res.data);
        } else {
          // Mode Spotify → appel backend /spotify/me-auto
          const res = await axios.get("http://localhost:3000/spotify/me-auto");
          setProfile(res.data);
        }
      } catch (error) {
        console.error("Erreur récupération profil:", error);
      }
    };

    fetchProfile();
  }, [token]);

  if (!profile) return <p>Chargement...</p>;

  // Déterminer le nom à afficher
  const displayName = profile.display_name || profile.email || "Utilisateur";

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", textAlign: "center" }}>
      <h1>Bienvenue 🎶</h1>
      <h2>{displayName}</h2>

      {profile.images && profile.images[0] && (
        <img
          src={profile.images[0].url}
          alt="avatar"
          style={{ width: "150px", borderRadius: "50%", marginBottom: "1rem" }}
        />
      )}

      <p>
        {token
          ? "Tu es connecté avec ton compte local ✅"
          : "Tu es connecté avec ton compte Spotify 🎵"}
      </p>

      {/* 🔹 Boutons d’action */}
      <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", justifyContent: "center" }}>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/mon-compte")}
        >
          Voir mon compte
        </button>

        <button
          className="btn btn-outline-danger"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          Déconnexion
        </button>
      </div>
    </div>
  );
};
