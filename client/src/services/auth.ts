// ✅ Sauvegarde login interne
export function saveAuthLogin(token: string) {
  localStorage.setItem("token", token); // JWT interne
}

// ✅ Sauvegarde login Spotify
export function saveSpotifyLogin(appToken: string, accessToken: string, refreshToken: string) {
  localStorage.setItem("token", appToken); // JWT interne
  localStorage.setItem("spotify_token_access", accessToken); // Spotify API access
  localStorage.setItem("spotify_token_refresh", refreshToken); // Spotify refresh
}

// ✅ Récupération des tokens
export function getAppToken() {
  return localStorage.getItem("token");
}

export function getSpotifyAccessToken() {
  return localStorage.getItem("spotify_token_access");
}

export function getSpotifyRefreshToken() {
  return localStorage.getItem("spotify_token_refresh");
}

export function clearAuth() {
  localStorage.clear();
}
