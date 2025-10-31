// src/hooks/useSpotifyProfile.ts
import { useEffect, useState } from "react";
import { spotifyService } from "../services/spotifyService";
import { useAuth } from "../contexts/AuthContext";

export const useSpotifyProfile = () => {
  const { token, role } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!token || role !== "user") return;
    spotifyService
      .getProfile()
      .then(setProfile)
      .catch((err) => console.error("Erreur profil Spotify:", err));
  }, [token, role]);

  return profile;
};
