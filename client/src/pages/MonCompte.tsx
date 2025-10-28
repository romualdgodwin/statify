import { useEffect, useState } from "react";
import axios from "axios";
import api from "../services/api"; // ✅ axios centralisé
import { useAuth } from "../contexts/AuthContext";

type LocalUser = {
  id: number;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

type SpotifyProfile = {
  id: string;
  display_name: string;
  email: string;
  images?: { url: string }[];
};

export const MonCompte = () => {
  const { spotifyAccessToken } = useAuth();
  const [localUser, setLocalUser] = useState<LocalUser | null>(null);
  const [spotifyProfile, setSpotifyProfile] = useState<SpotifyProfile | null>(null);

  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [isLoadingSpotify, setIsLoadingSpotify] = useState(false);

  const [errorUser, setErrorUser] = useState<string | null>(null);
  const [errorSpotify, setErrorSpotify] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoadingUser(true);
      try {
        const res = await api.get("/users/me"); // ✅ passe par api.ts → JWT auto ajouté
        setLocalUser(res.data);
      } catch {
        setErrorUser("Impossible de récupérer les infos utilisateur");
      } finally {
        setIsLoadingUser(false);
      }
    };

    const fetchSpotify = async () => {
      if (!spotifyAccessToken) return;
      setIsLoadingSpotify(true);
      try {
        // ⚠️ Ici on doit passer le vrai accessToken Spotify
        const res = await axios.get("http://localhost:3000/spotify/me", {
          headers: { Authorization: `Bearer ${spotifyAccessToken}` },
        });
        setSpotifyProfile(res.data);
      } catch {
        setErrorSpotify("Impossible de récupérer les infos Spotify");
      } finally {
        setIsLoadingSpotify(false);
      }
    };

    fetchUser();
    fetchSpotify();
  }, [spotifyAccessToken]);

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
      <div style={{ width: "100%", maxWidth: "800px" }}>
        <h2 className="mb-4 text-center">Mon Compte</h2>

        <div className="row">
          {/* Compte local */}
          <div className="col-md-6 mb-3 d-flex justify-content-center">
            <div
              className="card shadow-sm p-3 text-white"
              style={{
                maxWidth: "350px",
                width: "100%",
                background: "rgba(24,24,24,0.9)",
                borderRadius: "12px",
              }}
            >
              <h4 className="mb-3">Compte local</h4>
              {isLoadingUser && <p>Chargement...</p>}
              {errorUser && <div className="alert alert-danger">{errorUser}</div>}
              {localUser && (
                <ul className="list-unstyled">
                  <li><strong>ID :</strong> {localUser.id}</li>
                  <li><strong>Email :</strong> {localUser.email}</li>
                  <li><strong>Rôle :</strong> {localUser.role}</li>
                  <li><strong>Créé le :</strong> {new Date(localUser.createdAt).toLocaleString()}</li>
                  <li><strong>Mis à jour le :</strong> {new Date(localUser.updatedAt).toLocaleString()}</li>
                </ul>
              )}
            </div>
          </div>

          {/* Profil Spotify */}
          <div className="col-md-6 mb-3 d-flex justify-content-center">
            <div
              className="card shadow-sm p-3 text-center text-white"
              style={{
                maxWidth: "350px",
                width: "100%",
                background: "rgba(24,24,24,0.9)",
                borderRadius: "12px",
              }}
            >
              <h4 className="mb-3">Profil Spotify</h4>
              {isLoadingSpotify && <p>Chargement...</p>}
              {errorSpotify && <div className="alert alert-danger">{errorSpotify}</div>}
              {spotifyProfile ? (
                <>
                  {spotifyProfile.images?.[0] && (
                    <img
                      src={spotifyProfile.images[0].url}
                      alt="Spotify avatar"
                      width={120}
                      className="rounded-circle mb-3 shadow"
                    />
                  )}
                  <p><strong>Pseudo :</strong> {spotifyProfile.display_name}</p>
                  <p><strong>Email Spotify :</strong> {spotifyProfile.email}</p>
                  <p><strong>ID Spotify :</strong> {spotifyProfile.id}</p>
                </>
              ) : (
                <>
                  <p className="text-muted mb-3">Pas encore connecté à Spotify 🎵</p>
                  <button className="btn btn-success" onClick={handleSpotifyLogin}>
                    🎵 Connecter mon Spotify
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
