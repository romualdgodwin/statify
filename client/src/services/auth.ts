// Sauvegarde login interne
export function saveAuthLogin(token: string) {
  localStorage.setItem("app_token", token); // même clé que dans AuthContext
}

// Sauvegarde login Spotify
export function saveSpotifyLogin(appToken: string, accessToken: string, refreshToken: string) {
  localStorage.setItem("app_token", appToken); // même clé
  localStorage.setItem("spotify_token_access", accessToken);
  localStorage.setItem("spotify_token_refresh", refreshToken);
}

//  Récupération des tokens
export function getAppToken() {
  return localStorage.getItem("app_token"); // même clé
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
