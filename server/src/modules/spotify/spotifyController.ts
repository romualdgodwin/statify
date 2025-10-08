import { Router, Request, Response } from 'express'
import axios from 'axios'
import querystring from 'querystring'
import { AppDataSource } from '../../dataSource'
import { User } from '../user/userEntity'
import jwt from 'jsonwebtoken'
import { getSpotifyAccessToken } from '../../utils/spotifyTokenManager'

const spotifyController = Router()
const userRepository = AppDataSource.getRepository(User)

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key'

// ======================================================
// 🔹 Helper pour récupérer le token dans les headers
// ======================================================
function getToken(req: Request): string | null {
  const token = req.headers.authorization?.split(' ')[1]
  return token || null
}

// ======================================================
// 🔹 Étape 1 : Redirection vers Spotify pour login
// ======================================================
spotifyController.get('/login', (_req: Request, res: Response) => {
  const scope = [
    'user-read-private',
    'user-read-email',
    'playlist-read-private',
    'user-top-read',
  ].join(' ')

  const redirectUri = process.env.SPOTIFY_REDIRECT_URI!

  res.redirect(
    `https://accounts.spotify.com/authorize?response_type=code&client_id=${
      process.env.SPOTIFY_CLIENT_ID
    }&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(
      redirectUri,
    )}`,
  )
})

// ======================================================
// 🔹 Étape 2 : Callback Spotify après login
// ======================================================
spotifyController.get('/callback', async (req: Request, res: Response) => {
  const code = req.query.code as string

  if (!code) {
    res.status(400).json({ error: 'Code manquant dans la requête' })
    return
  }

  try {
    const tokenResponse = await axios.post(
      'https://accounts.spotify.com/api/token',
      querystring.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
        client_id: process.env.SPOTIFY_CLIENT_ID!,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET!,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    )

    const { access_token, refresh_token, expires_in } = tokenResponse.data

    const profileResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${access_token}` },
    })

    const spotifyProfile = profileResponse.data

    let user = await userRepository.findOne({
      where: { spotifyId: spotifyProfile.id },
    })

    if (user) {
      user.spotifyAccessToken = access_token
      user.spotifyRefreshToken = refresh_token
      user.tokenExpiresAt = new Date(Date.now() + expires_in * 1000)
    } else {
      user = userRepository.create({
        email: spotifyProfile.email,
        displayName: spotifyProfile.display_name,
        spotifyId: spotifyProfile.id,
        spotifyAccessToken: access_token,
        spotifyRefreshToken: refresh_token,
        tokenExpiresAt: new Date(Date.now() + expires_in * 1000),
      })
    }

    await userRepository.save(user)

    const appToken = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { algorithm: 'HS256', expiresIn: '1h' },
    )

    // 🔹 Redirection vers le front (au lieu de renvoyer du JSON)
    const frontendUrl =
      process.env.FRONTEND_URL || 'http://localhost:5173'
    res.redirect(
      `${frontendUrl}/spotify-callback?appToken=${appToken}&spotifyAccessToken=${access_token}&spotifyRefreshToken=${refresh_token}`,
    )
  } catch (error: any) {
    console.error('❌ Erreur Spotify callback:', error.response?.data || error.message)
    res.status(500).send('Erreur lors de l’authentification Spotify')
  }
})

// ======================================================
// 🔹 Profil utilisateur
// ======================================================
spotifyController.get('/me', async (req: Request, res: Response) => {
  const token = getToken(req)
  if (!token) {
    res.status(401).json({ error: 'Token manquant' })
    return
  }

  try {
    const response = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    res.json(response.data)
  } catch (error: any) {
    console.error('❌ Erreur Spotify /me:', error.response?.data || error.message)
    res.status(500).send('Erreur lors de la récupération du profil Spotify')
  }
})

spotifyController.get('/me-auto', async (_req: Request, res: Response) => {
  try {
    const token = await getSpotifyAccessToken()
    const response = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    res.json(response.data)
  } catch (error: any) {
    console.error('❌ Erreur Spotify me-auto:', error.response?.data || error.message)
    res.status(500).send('Erreur lors de la récupération du profil Spotify (auto refresh)')
  }
})

// ======================================================
// 🔹 Top artistes
// ======================================================
spotifyController.get('/top-artists', async (req: Request, res: Response) => {
  const token = getToken(req)
  if (!token) {
    res.status(401).json({ error: 'Token manquant' })
    return
  }

  try {
    const response = await axios.get('https://api.spotify.com/v1/me/top/artists', {
      headers: { Authorization: `Bearer ${token}` },
    })
    res.json(response.data)
  } catch (error: any) {
    console.error('❌ Erreur Spotify top-artists:', error.response?.data || error.message)
    res.status(500).send('Erreur lors de la récupération des artistes')
  }
})

spotifyController.get('/top-artists-auto', async (_req: Request, res: Response) => {
  try {
    const token = await getSpotifyAccessToken()
    const response = await axios.get('https://api.spotify.com/v1/me/top/artists', {
      headers: { Authorization: `Bearer ${token}` },
    })
    res.json(response.data)
  } catch (error: any) {
    console.error('❌ Erreur Spotify top-artists-auto:', error.response?.data || error.message)
    res.status(500).send('Erreur lors de la récupération des artistes (auto refresh)')
  }
})

// ======================================================
// 🔹 Top musiques
// ======================================================
spotifyController.get('/top-tracks', async (req: Request, res: Response) => {
  const token = getToken(req)
  if (!token) {
    res.status(401).json({ error: 'Token manquant' })
    return
  }

  try {
    const response = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
      headers: { Authorization: `Bearer ${token}` },
    })
    res.json(response.data)
  } catch (error: any) {
    console.error('❌ Erreur Spotify top-tracks:', error.response?.data || error.message)
    res.status(500).send('Erreur lors de la récupération des musiques')
  }
})

spotifyController.get('/top-tracks-auto', async (_req: Request, res: Response) => {
  try {
    const token = await getSpotifyAccessToken()
    const response = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
      headers: { Authorization: `Bearer ${token}` },
    })
    res.json(response.data)
  } catch (error: any) {
    console.error('❌ Erreur Spotify top-tracks-auto:', error.response?.data || error.message)
    res.status(500).send('Erreur lors de la récupération des musiques (auto refresh)')
  }
})

// ======================================================
// 🔹 Playlists utilisateur
// ======================================================
spotifyController.get('/playlists', async (req: Request, res: Response) => {
  const token = getToken(req)
  if (!token) {
    res.status(401).json({ error: 'Token manquant' })
    return
  }

  try {
    const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
      headers: { Authorization: `Bearer ${token}` },
    })
    res.json(response.data)
  } catch (error: any) {
    console.error('❌ Erreur Spotify playlists:', error.response?.data || error.message)
    res.status(500).send('Erreur lors de la récupération des playlists')
  }
})

spotifyController.get('/playlists-auto', async (_req: Request, res: Response) => {
  try {
    const token = await getSpotifyAccessToken()
    const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
      headers: { Authorization: `Bearer ${token}` },
    })
    res.json(response.data)
  } catch (error: any) {
    console.error('❌ Erreur Spotify playlists-auto:', error.response?.data || error.message)
    res.status(500).send('Erreur lors de la récupération des playlists (auto refresh)')
  }
})

// ======================================================
// 🔹 Détails d’une playlist
// ======================================================
spotifyController.get('/playlists/:id', async (req: Request, res: Response) => {
  const token = getToken(req)
  if (!token) {
    res.status(401).json({ error: 'Token manquant' })
    return
  }

  try {
    const response = await axios.get(`https://api.spotify.com/v1/playlists/${req.params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    res.json(response.data)
  } catch (error: any) {
    console.error('❌ Erreur Spotify playlist/:id:', error.response?.data || error.message)
    res.status(500).send('Erreur lors de la récupération de la playlist')
  }
})

spotifyController.get('/playlists/:id-auto', async (req: Request, res: Response) => {
  try {
    const token = await getSpotifyAccessToken()
    const response = await axios.get(`https://api.spotify.com/v1/playlists/${req.params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    res.json(response.data)
  } catch (error: any) {
    console.error('❌ Erreur Spotify playlist/:id-auto:', error.response?.data || error.message)
    res.status(500).send('Erreur lors de la récupération de la playlist (auto refresh)')
  }
})

// ======================================================
// 🔹 Recherche Spotify
// ======================================================
spotifyController.get('/search', async (req: Request, res: Response) => {
  const token = getToken(req)
  if (!token) {
    res.status(401).json({ error: 'Token manquant' })
    return
  }

  const query = req.query.query as string
  const type = (req.query.type as string) || 'track,artist'

  if (!query) {
    res.status(400).json({ error: "Paramètre 'query' manquant" })
    return
  }

  try {
    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: { Authorization: `Bearer ${token}` },
      params: { q: query, type },
    })
    res.json(response.data)
  } catch (error: any) {
    console.error('❌ Erreur Spotify search:', error.response?.data || error.message)
    res.status(500).send('Erreur lors de la recherche Spotify')
  }
})

spotifyController.get('/search-auto', async (req: Request, res: Response) => {
  const query = req.query.query as string
  const type = (req.query.type as string) || 'track,artist'

  if (!query) {
    res.status(400).json({ error: "Paramètre 'query' manquant" })
    return
  }

  try {
    const token = await getSpotifyAccessToken()
    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: { Authorization: `Bearer ${token}` },
      params: { q: query, type },
    })
    res.json(response.data)
  } catch (error: any) {
    console.error('❌ Erreur Spotify search-auto:', error.response?.data || error.message)
    res.status(500).send('Erreur lors de la recherche Spotify (auto refresh)')
  }
})

// ======================================================
// 🔹 Rafraîchir un access_token avec le refresh_token
// ======================================================
spotifyController.post('/refresh', async (req: Request, res: Response) => {
  const { refresh_token } = req.body

  if (!refresh_token) {
    res.status(400).json({ error: 'Refresh token manquant' })
    return
  }

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token,
        client_id: process.env.SPOTIFY_CLIENT_ID!,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET!,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    )
    res.json(response.data)
  } catch (error: any) {
    console.error('❌ Erreur Spotify refresh:', error.response?.data || error.message)
    res.status(500).send('Erreur lors du rafraîchissement du token')
  }
})

export default spotifyController
