// server/src/modules/spotify/spotifyController.ts
import {
  Router,
  Request,
  Response,
  RequestHandler,
} from 'express'
import axios from 'axios'
import querystring from 'querystring'
import { AppDataSource } from '../../dataSource'
import { User } from '../user/userEntity'
import jwt from 'jsonwebtoken'
import { getValidAccessToken } from '../../utils/spotifyTokenManager'
import { UserHistory } from '../../userHistory/userHistoryEntity'
import {
  AuthRequest,
  requireSpotifyUser,
} from '../auth/authMiddleware'
import { generateBadges } from '../../services/badgeService'

const spotifyController = Router()
const userRepository = AppDataSource.getRepository(User)
const userHistoryRepository =
  AppDataSource.getRepository(UserHistory)

const JWT_SECRET =
  process.env.JWT_SECRET || 'dev_secret_key'

// ======================================================
// 🔹 Helper pour récupérer le token brut dans les headers
// ======================================================
function getToken(req: Request): string | null {
  const token = req.headers.authorization?.split(' ')[1]
  return token || null
}

// ======================================================
// 🔹 Étape 1 : Redirection vers Spotify pour login
// ======================================================
spotifyController.get(
  '/login',
  (_req: Request, res: Response) => {
    const scope = [
      'user-read-private',
      'user-read-email',
      'playlist-read-private',
      'user-top-read',
      'user-read-recently-played',
      'user-library-read',
      'user-read-playback-state',
    ].join(' ')

    const redirectUri = process.env.SPOTIFY_REDIRECT_URI!

    res.redirect(
      `https://accounts.spotify.com/authorize?response_type=code&client_id=${
        process.env.SPOTIFY_CLIENT_ID
      }&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(
        redirectUri,
      )}&show_dialog=true`,
    )
  },
)

// ======================================================
// 🔹 Étape 2 : Callback Spotify après login
// ======================================================
spotifyController.get('/callback', (async (
  req: Request,
  res: Response,
): Promise<void> => {
  const code = req.query.code as string
  if (!code) {
    res
      .status(400)
      .json({ error: 'Code manquant dans la requête' })
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
      {
        headers: {
          'Content-Type':
            'application/x-www-form-urlencoded',
        },
      },
    )

    const { access_token, refresh_token, expires_in } =
      tokenResponse.data

    // Profil Spotify
    const profileResponse = await axios.get(
      'https://api.spotify.com/v1/me',
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    )
    const spotifyProfile = profileResponse.data

    // Vérifier si l’utilisateur existe déjà
    let user = await userRepository.findOne({
      where: { spotifyId: spotifyProfile.id },
    })

    if (user) {
      user.spotifyAccessToken = access_token
      user.spotifyRefreshToken = refresh_token
      user.tokenExpiresAt = new Date(
        Date.now() + expires_in * 1000,
      )
      user.role = 'user' // ⚠️ toujours user
    } else {
      user = userRepository.create({
        email: spotifyProfile.email,
        displayName: spotifyProfile.display_name,
        spotifyId: spotifyProfile.id,
        spotifyAccessToken: access_token,
        spotifyRefreshToken: refresh_token,
        tokenExpiresAt: new Date(
          Date.now() + expires_in * 1000,
        ),
        role: 'user',
      })
    }

    await userRepository.save(user)

    // Générer un JWT interne
    const appToken = jwt.sign(
      {
        id: user.id,
        role: 'user',
        displayName: user.displayName,
        spotifyId: user.spotifyId,
        email: user.email,
      },
      JWT_SECRET,
      { algorithm: 'HS256', expiresIn: '7d' },
    )

    const frontendUrl =
      process.env.FRONTEND_URL || 'http://localhost:5173'
    res.redirect(
      `${frontendUrl}/spotify-callback?type=spotify&appToken=${appToken}&spotifyAccessToken=${access_token}&spotifyRefreshToken=${refresh_token}`,
    )
  } catch (error: any) {
    console.error(
      '❌ Erreur Spotify callback:',
      error.response?.data || error.message,
    )
    res
      .status(500)
      .send('Erreur lors de l’authentification Spotify')
  }
}) as RequestHandler)

// ======================================================
// 🔹 Profil utilisateur (token brut Spotify direct)
// ======================================================
spotifyController.get(
  '/me',
  async (req: Request, res: Response): Promise<void> => {
    const token = getToken(req)
    if (!token) {
      res.status(401).json({ error: 'Token manquant' })
      return
    }

    try {
      const response = await axios.get(
        'https://api.spotify.com/v1/me',
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      res.json(response.data)
    } catch (error: any) {
      console.error(
        '❌ Erreur Spotify /me:',
        error.response?.data || error.message,
      )
      res
        .status(500)
        .send(
          'Erreur lors de la récupération du profil Spotify',
        )
    }
  },
)

// ======================================================
// 🔹 Profil via auto-refresh (DB)
// ======================================================
spotifyController.get(
  '/me-auto',
  requireSpotifyUser,
  async (
    req: AuthRequest,
    res: Response,
  ): Promise<void> => {
    try {
      const userId = req.user?.id
      if (!userId) {
        res
          .status(401)
          .json({ error: 'Utilisateur non authentifié' })
        return
      }

      const user = await userRepository.findOneBy({
        id: userId,
      })
      if (!user) {
        res
          .status(404)
          .json({ error: 'Utilisateur introuvable' })
        return
      }

      const token = await getValidAccessToken(user)
      const response = await axios.get(
        'https://api.spotify.com/v1/me',
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      res.json(response.data)
    } catch (error: any) {
      console.error(
        '❌ Erreur Spotify me-auto:',
        error.response?.data || error.message,
      )
      res
        .status(500)
        .send(
          'Erreur lors de la récupération du profil Spotify (auto refresh)',
        )
    }
  },
)

// ======================================================
// 🔹 Top artistes
// ======================================================
spotifyController.get(
  '/top-artists',
  async (req: Request, res: Response): Promise<void> => {
    const token = getToken(req)
    if (!token) {
      res.status(401).json({ error: 'Token manquant' })
      return
    }

    try {
      const response = await axios.get(
        'https://api.spotify.com/v1/me/top/artists',
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      res.json(response.data)
    } catch (error: any) {
      console.error(
        '❌ Erreur Spotify top-artists:',
        error.response?.data || error.message,
      )
      res
        .status(500)
        .send('Erreur lors de la récupération des artistes')
    }
  },
)

// ======================================================
// 🔹 Top musiques
// ======================================================
spotifyController.get(
  '/top-tracks',
  async (req: Request, res: Response): Promise<void> => {
    const token = getToken(req)
    if (!token) {
      res.status(401).json({ error: 'Token manquant' })
      return
    }

    try {
      const response = await axios.get(
        'https://api.spotify.com/v1/me/top/tracks',
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      res.json(response.data)
    } catch (error: any) {
      console.error(
        '❌ Erreur Spotify top-tracks:',
        error.response?.data || error.message,
      )
      res
        .status(500)
        .send('Erreur lors de la récupération des musiques')
    }
  },
)

// ======================================================
// 🔹 Playlists utilisateur
// ======================================================
spotifyController.get(
  '/playlists',
  async (req: Request, res: Response): Promise<void> => {
    const token = getToken(req)
    if (!token) {
      res.status(401).json({ error: 'Token manquant' })
      return
    }

    try {
      const response = await axios.get(
        'https://api.spotify.com/v1/me/playlists',
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      res.json(response.data)
    } catch (error: any) {
      console.error(
        '❌ Erreur Spotify playlists:',
        error.response?.data || error.message,
      )
      res
        .status(500)
        .send(
          'Erreur lors de la récupération des playlists',
        )
    }
  },
)

// ======================================================
// 🔹 Recherche Spotify
// ======================================================
spotifyController.get(
  '/search',
  async (req: Request, res: Response): Promise<void> => {
    const token = getToken(req)
    if (!token) {
      res.status(401).json({ error: 'Token manquant' })
      return
    }

    const query = req.query.query as string
    const type =
      (req.query.type as string) || 'track,artist'

    if (!query) {
      res
        .status(400)
        .json({ error: "Paramètre 'query' manquant" })
      return
    }

    try {
      const response = await axios.get(
        'https://api.spotify.com/v1/search',
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { q: query, type },
        },
      )
      res.json(response.data)
    } catch (error: any) {
      console.error(
        '❌ Erreur Spotify search:',
        error.response?.data || error.message,
      )
      res
        .status(500)
        .send('Erreur lors de la recherche Spotify')
    }
  },
)

// ======================================================
// 🔹 Progression mensuelle (3 derniers mois)
// ======================================================
spotifyController.get(
  '/monthly-stats',
  async (req: Request, res: Response): Promise<void> => {
    const token = getToken(req)
    if (!token) {
      res.status(401).json({ error: 'Token manquant' })
      return
    }

    try {
      const response = await axios.get(
        'https://api.spotify.com/v1/me/player/recently-played?limit=50',
        { headers: { Authorization: `Bearer ${token}` } },
      )

      const items = response.data.items
      const monthlyCount: Record<string, number> = {}

      items.forEach((play: any) => {
        const d = new Date(play.played_at)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        monthlyCount[key] = (monthlyCount[key] || 0) + 1
      })

      const now = new Date()
      const lastThree: string[] = []
      for (let i = 2; i >= 0; i--) {
        const d = new Date(
          now.getFullYear(),
          now.getMonth() - i,
          1,
        )
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        lastThree.push(key)
      }

      const formatted = lastThree.map((m) => {
        const [year, month] = m.split('-')
        const label = new Date(
          parseInt(year),
          parseInt(month) - 1,
        ).toLocaleString('fr-FR', {
          month: 'short',
          year: 'numeric',
        })
        return { label, value: monthlyCount[m] || 0 }
      })

      res.json(formatted)
    } catch (error: any) {
      console.error(
        '❌ Erreur Spotify monthly-stats:',
        error.response?.data || error.message,
      )
      res
        .status(500)
        .send(
          'Erreur lors de la récupération des stats mensuelles',
        )
    }
  },
)

// ======================================================
// 🔹 Recently Played (sauvegarde UserHistory)
// ======================================================
spotifyController.get(
  '/recently-played',
  requireSpotifyUser,
  async (
    req: AuthRequest,
    res: Response,
  ): Promise<void> => {
    try {
      const userId = req.user?.id
      if (!userId) {
        res
          .status(401)
          .json({ error: 'Utilisateur non authentifié' })
        return
      }

      const user = await userRepository.findOneBy({
        id: userId,
      })
      if (!user) {
        res
          .status(404)
          .json({ error: 'Utilisateur introuvable' })
        return
      }

      const token = await getValidAccessToken(user)

      const response = await axios.get(
        'https://api.spotify.com/v1/me/player/recently-played?limit=20',
        { headers: { Authorization: `Bearer ${token}` } },
      )

      const items = response.data.items

      for (const play of items) {
        await userHistoryRepository.save({
          user: { id: userId },
          trackName: play.track.name,
          artistName: play.track.artists
            .map((a: any) => a.name)
            .join(', '),
          playedAt: new Date(play.played_at),
        })
      }

      res.json(response.data)
    } catch (error: any) {
      console.error(
        '❌ Erreur Spotify recently-played:',
        error.response?.data || error.message,
      )
      res
        .status(500)
        .send(
          'Erreur lors de la récupération des titres récemment joués',
        )
    }
  },
)

// ======================================================
// 🔹 Comparaison entre 3 utilisateurs
// ======================================================
const compareHandler: RequestHandler = async (
  _req,
  res,
): Promise<void> => {
  try {
    const users = await userRepository.find({ take: 3 })

    if (users.length < 3) {
      res
        .status(400)
        .json({
          error:
            'Il faut au moins 3 utilisateurs pour comparer',
        })
      return
    }

    const popularityAverages: number[] = []
    const genreStats: Record<string, number[]> = {}

    for (let i = 0; i < users.length; i++) {
      const user = users[i]
      if (!user.spotifyAccessToken) {
        popularityAverages.push(0)
        continue
      }

      const response = await axios.get(
        'https://api.spotify.com/v1/me/top/tracks?limit=20',
        {
          headers: {
            Authorization: `Bearer ${user.spotifyAccessToken}`,
          },
        },
      )

      const tracks = response.data.items || []

      if (tracks.length > 0) {
        const avg =
          tracks.reduce(
            (sum: number, t: any) => sum + t.popularity,
            0,
          ) / tracks.length
        popularityAverages.push(Math.round(avg))
      } else {
        popularityAverages.push(0)
      }

      const genreCount: Record<string, number> = {}
      for (const track of tracks) {
        for (const artist of track.artists) {
          try {
            const artistRes = await axios.get(
              `https://api.spotify.com/v1/artists/${artist.id}`,
              {
                headers: {
                  Authorization: `Bearer ${user.spotifyAccessToken}`,
                },
              },
            )
            const artistGenres = artistRes.data.genres || []
            artistGenres.forEach((g: string) => {
              genreCount[g] = (genreCount[g] || 0) + 1
            })
          } catch (err) {
            console.error(
              `❌ Erreur récupération artiste ${artist.id}`,
              (err as any).message,
            )
          }
        }
      }

      const topGenres = Object.entries(genreCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)

      for (const [genre, count] of topGenres) {
        if (!genreStats[genre])
          genreStats[genre] = [0, 0, 0]
        genreStats[genre][i] = count
      }
    }

    res.json({
      users: users.map((u) => u.displayName || u.email),
      avgPopularity: popularityAverages,
      genres: genreStats,
    })
  } catch (err) {
    console.error('❌ Erreur /spotify/compare:', err)
    res
      .status(500)
      .json({ error: 'Erreur lors de la comparaison' })
  }
}

spotifyController.get('/compare', compareHandler)

// ======================================================
// 🔹 Badges utilisateur
// ======================================================
spotifyController.get(
  '/badges',
  requireSpotifyUser,
  async (
    req: AuthRequest,
    res: Response,
  ): Promise<void> => {
    try {
      const userId = req.user?.id
      if (!userId) {
        res
          .status(401)
          .json({ error: 'Utilisateur non authentifié' })
        return
      }

      const badges = await generateBadges(userId)
      res.json({ badges })
    } catch (err) {
      console.error('❌ Erreur /spotify/badges:', err)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  },
)

// ======================================================
// 🔹 Rafraîchir un access_token avec refresh_token
// ======================================================
spotifyController.post(
  '/refresh',
  async (req: Request, res: Response): Promise<void> => {
    const { refresh_token } = req.body
    if (!refresh_token) {
      res
        .status(400)
        .json({ error: 'Refresh token manquant' })
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
        {
          headers: {
            'Content-Type':
              'application/x-www-form-urlencoded',
          },
        },
      )
      res.json(response.data)
    } catch (error: any) {
      console.error(
        '❌ Erreur Spotify refresh:',
        error.response?.data || error.message,
      )
      res
        .status(500)
        .send('Erreur lors du rafraîchissement du token')
    }
  },
)

export default spotifyController
