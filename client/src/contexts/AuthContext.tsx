import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { jwtDecode } from "jwt-decode";

// Type de ton JWT décodé
type DecodedToken = {
  id: number;
  role: string;
  displayName?: string;
  email?: string;
  spotifyId?: string;
  exp: number;
};

type AuthContextType = {
  token: string | null;
  spotifyAccessToken: string | null;
  spotifyRefreshToken: string | null;
  role: string | null;
  userInfo: DecodedToken | null;
  login: (
    token: string,
    spotifyAccessToken?: string | null,
    spotifyRefreshToken?: string | null,
    role?: string | null            // ✅ ajouté
  ) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [spotifyAccessToken, setSpotifyAccessToken] = useState<string | null>(null);
  const [spotifyRefreshToken, setSpotifyRefreshToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<DecodedToken | null>(null);

  // 🔑 clés locales centralisées
  const STORAGE_KEYS = {
    token: "app_token",
    spotifyAccess: "spotify_token_access",
    spotifyRefresh: "spotify_token_refresh",
    role: "user_role",
  };

  // Charger depuis localStorage au démarrage
  useEffect(() => {
    const savedToken = localStorage.getItem(STORAGE_KEYS.token);
    const savedSpotifyAccessToken = localStorage.getItem(STORAGE_KEYS.spotifyAccess);
    const savedSpotifyRefreshToken = localStorage.getItem(STORAGE_KEYS.spotifyRefresh);
    const savedRole = localStorage.getItem(STORAGE_KEYS.role);

    if (savedToken) {
      try {
        const decoded = jwtDecode<DecodedToken>(savedToken);

        if (decoded.exp * 1000 < Date.now()) {
          logout();
          return;
        }

        setToken(savedToken);
        setUserInfo(decoded);
        setRole(decoded.role || null);
      } catch (err) {
        console.error("❌ Erreur décodage JWT au démarrage:", err);
        logout();
      }
    }

    if (savedSpotifyAccessToken) setSpotifyAccessToken(savedSpotifyAccessToken);
    if (savedSpotifyRefreshToken) setSpotifyRefreshToken(savedSpotifyRefreshToken);
    if (savedRole) setRole(savedRole);
  }, []);

  // ✅ Méthode login
  const login = (
    newToken: string,
    newSpotifyAccessToken: string | null = null,
    newSpotifyRefreshToken: string | null = null,
    newRole: string | null = null              // ✅ ajouté
  ) => {
    localStorage.setItem(STORAGE_KEYS.token, newToken);
    setToken(newToken);

    try {
      const decoded = jwtDecode<DecodedToken>(newToken);

      if (decoded.exp * 1000 < Date.now()) {
        logout();
        return;
      }

      setUserInfo(decoded);

      // Si `role` est passé en paramètre → priorité sur celui du token
      const roleToUse = newRole || decoded.role || null;
      setRole(roleToUse);
      if (roleToUse) localStorage.setItem(STORAGE_KEYS.role, roleToUse);
    } catch (err) {
      console.error("❌ Erreur décodage JWT:", err);
      logout();
    }

    if (newSpotifyAccessToken) {
      localStorage.setItem(STORAGE_KEYS.spotifyAccess, newSpotifyAccessToken);
      setSpotifyAccessToken(newSpotifyAccessToken);
    } else {
      localStorage.removeItem(STORAGE_KEYS.spotifyAccess);
      setSpotifyAccessToken(null);
    }

    if (newSpotifyRefreshToken) {
      localStorage.setItem(STORAGE_KEYS.spotifyRefresh, newSpotifyRefreshToken);
      setSpotifyRefreshToken(newSpotifyRefreshToken);
    } else {
      localStorage.removeItem(STORAGE_KEYS.spotifyRefresh);
      setSpotifyRefreshToken(null);
    }
  };

  // Déconnexion
  const logout = () => {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    setToken(null);
    setSpotifyAccessToken(null);
    setSpotifyRefreshToken(null);
    setRole(null);
    setUserInfo(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        spotifyAccessToken,
        spotifyRefreshToken,
        role,
        userInfo,
        login,
        logout,
      }}
    >
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
