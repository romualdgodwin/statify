import axios from "axios";
import querystring from "querystring";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
let accessToken: string | null = null;
let refreshToken: string | null = null;
let tokenExpiresAt: number | null = null;

/**
 * Initialise le gestionnaire avec un refresh_token existant
 */
export function initSpotifyTokens(initialRefreshToken: string) {
  refreshToken = initialRefreshToken;
}

/**
 * Récupère un access_token valide
 */
export async function getSpotifyAccessToken(): Promise<string> {
  // si le token actuel est encore valide, on le renvoie
  if (accessToken && tokenExpiresAt && Date.now() < tokenExpiresAt) {
    return accessToken;
  }

  if (!refreshToken) {
    throw new Error("❌ Aucun refresh_token disponible. Authentifie-toi d’abord avec /spotify/login.");
  }

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    accessToken = response.data.access_token;
    // expires_in est en secondes -> convertir en ms
    tokenExpiresAt = Date.now() + response.data.expires_in * 1000;

    console.log("✅ Nouveau Spotify access_token obtenu !");
    return accessToken!;
  } catch (error: any) {
    console.error("❌ Erreur lors du refresh Spotify:", error.response?.data || error.message);
    throw error;
  }
}
