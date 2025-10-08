import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type AuthContextType = {
  token: string | null;
  spotifyAccessToken: string | null;
  spotifyRefreshToken: string | null;
  login: (token: string, spotifyAccessToken: string, spotifyRefreshToken: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [spotifyAccessToken, setSpotifyAccessToken] = useState<string | null>(null);
  const [spotifyRefreshToken, setSpotifyRefreshToken] = useState<string | null>(null);

  // Charger depuis localStorage au démarrage
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedSpotifyAccessToken = localStorage.getItem("spotifyAccessToken");
    const savedSpotifyRefreshToken = localStorage.getItem("spotifyRefreshToken");

    if (savedToken) setToken(savedToken);
    if (savedSpotifyAccessToken) setSpotifyAccessToken(savedSpotifyAccessToken);
    if (savedSpotifyRefreshToken) setSpotifyRefreshToken(savedSpotifyRefreshToken);
  }, []);

  // Méthode login → enregistre tout
  const login = (newToken: string, newSpotifyAccessToken: string, newSpotifyRefreshToken: string) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("spotifyAccessToken", newSpotifyAccessToken);
    localStorage.setItem("spotifyRefreshToken", newSpotifyRefreshToken);

    setToken(newToken);
    setSpotifyAccessToken(newSpotifyAccessToken);
    setSpotifyRefreshToken(newSpotifyRefreshToken);
  };

  // Déconnexion → supprime tout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("spotifyAccessToken");
    localStorage.removeItem("spotifyRefreshToken");

    setToken(null);
    setSpotifyAccessToken(null);
    setSpotifyRefreshToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, spotifyAccessToken, spotifyRefreshToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
};
