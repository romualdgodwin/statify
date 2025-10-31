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
import {AuthRequest,requireAuth,requireSpotifyUser} from '../auth/authMiddleware'
import { generateBadges } from '../../services/badgeService'
import { getDailyStats } from "../../services/statsService";
import { getAllBadgeDefinitions } from '../../services/badgeService'


const spotifyController = Router()
const userRepository = AppDataSource.getRepository(User)
const userHistoryRepository =
  AppDataSource.getRepository(UserHistory)

if (!process.env.JWT_SECRET) {
  throw new Error(
    '❌ JWT_SECRET manquant dans le fichier .env'
  )
}
const JWT_SECRET = process.env.JWT_SECRET

// ======================================================
// 🔹 Login Spotify
// ======================================================
spotifyController.get('/login', ((_req, res): void => {
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
    }&scope=${encodeURIComponent(
      scope
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&show_dialog=true`
  )
}) as RequestHandler)

// ======================================================
// 🔹 Callback Spotify
// ======================================================
spotifyController.get('/callback', (async (
  req: Request,
  res: Response
): Promise<void> => {
  const code = req.query.code as string
  if (!code) {
    res.status(400).json({ error: 'Code manquant' })
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
      }
    )

    const { access_token, refresh_token, expires_in } =
      tokenResponse.data

    const profileResponse = await axios.get(
      'https://api.spotify.com/v1/me',
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    )
    const spotifyProfile = profileResponse.data

    let user = await userRepository.findOne({
      where: { spotifyId: spotifyProfile.id },
    })
    if (user) {
      user.spotifyAccessToken = access_token
      user.spotifyRefreshToken = refresh_token
      user.tokenExpiresAt = new Date(
        Date.now() + expires_in * 1000
      )
      user.role = user.role || 'user'
    } else {
      user = userRepository.create({
        email: spotifyProfile.email,
        displayName: spotifyProfile.display_name,
        spotifyId: spotifyProfile.id,
        spotifyAccessToken: access_token,
        spotifyRefreshToken: refresh_token,
        tokenExpiresAt: new Date(
          Date.now() + expires_in * 1000
        ),
        role: 'user',
      })
    }
    await userRepository.save(user)

    const appToken = jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email,
        displayName: user.displayName,
        spotifyId: user.spotifyId,
      },
      JWT_SECRET,
      { algorithm: 'HS256', expiresIn: '7d' }
    )

    const frontendUrl =
      process.env.FRONTEND_URL || 'http://localhost:5173'
    res.redirect(
      `${frontendUrl}/spotify-callback?type=spotify&appToken=${appToken}&spotifyAccessToken=${access_token}&spotifyRefreshToken=${refresh_token}`
    )
    return
  } catch (error: any) {
    console.error(
      '❌ Erreur callback:',
      error.response?.data || error.message
    )
    res.status(500).send('Erreur authentification Spotify')
    return
  }
}) as RequestHandler)

// ======================================================
// 🔹 Profil Spotify direct (utilise accessToken passé par le client)
// ======================================================
spotifyController.get(
  "/me",
  requireAuth,
  requireSpotifyUser,
  (async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Utilisateur non authentifié" });
        return;
      }

      const user = await userRepository.findOneBy({ id: userId });
      if (!user) {
        res.status(404).json({ error: "Utilisateur introuvable" });
        return;
      }

      // ✅ récupère automatiquement un token valide (refresh si besoin)
      const token = await getValidAccessToken(user);

      const response = await axios.get("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      res.json(response.data);
    } catch (error: any) {
      console.error("❌ Erreur /spotify/me:", error.response?.data || error.message);
      res.status(500).json({ error: "Impossible de récupérer le profil Spotify" });
    }
  }) as RequestHandler
);

// ======================================================
// 🔹 Profil via DB auto-refresh
// ======================================================
spotifyController.get(
  '/me-auto',
  requireAuth,
  requireSpotifyUser,
  (async (
    req: AuthRequest,
    res: Response
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
        }
      )

      res.json(response.data)
      return
    } catch {
      res
        .status(500)
        .json({
          error:
            'Erreur récupération profil (auto refresh)',
        })
      return
    }
  }) as RequestHandler
)
// ======================================================
// 🔹 Top artistes
// ======================================================
spotifyController.get(
  '/top-artists',
  requireAuth,
  requireSpotifyUser,
  (async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user?.id
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
        'https://api.spotify.com/v1/me/top/artists',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      res.json(response.data)
      return
    } catch {
      res
        .status(500)
        .json({ error: 'Erreur récupération top artistes' })
      return
    }
  }) as RequestHandler
)

// ======================================================
// 🔹 Top musiques
// ======================================================
spotifyController.get(
  '/top-tracks',
  requireAuth,
  requireSpotifyUser,
  (async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user?.id
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
        'https://api.spotify.com/v1/me/top/tracks',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      res.json(response.data)
      return
    } catch {
      res
        .status(500)
        .json({ error: 'Erreur récupération top musiques' })
      return
    }
  }) as RequestHandler
)

// ======================================================
// 🔹 Playlists
// ======================================================
spotifyController.get(
  '/playlists',
  requireAuth,
  requireSpotifyUser,
  (async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user?.id
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
        'https://api.spotify.com/v1/me/playlists',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      res.json(response.data)
      return
    } catch {
      res
        .status(500)
        .json({ error: 'Erreur récupération playlists' })
      return
    }
  }) as RequestHandler
)

// ======================================================
// 🔹 Recherche
// ======================================================
spotifyController.get(
  '/search',
  requireAuth,
  requireSpotifyUser,
  (async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
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
      const userId = req.user?.id
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
        'https://api.spotify.com/v1/search',
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { q: query, type },
        }
      )

      res.json(response.data)
      return
    } catch {
      res
        .status(500)
        .json({ error: 'Erreur recherche Spotify' })
      return
    }
  }) as RequestHandler
)

spotifyController.get(
  '/monthly-stats',
  requireAuth,
  requireSpotifyUser,
  (async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id
      if (!userId) {
        res.status(401).json({ error: 'Utilisateur non authentifié' })
        return
      }

      // On récupère tout l’historique en DB
      const history = await userHistoryRepository.find({
        where: { user: { id: userId } },
        order: { playedAt: 'DESC' },
      })

      const monthlyCount: Record<string, number> = {}

      history.forEach((play) => {
        if (!play.playedAt) return // ✅ on ignore si null
        const d = new Date(play.playedAt)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        monthlyCount[key] = (monthlyCount[key] || 0) + 1
      })

      const now = new Date()
      const lastThree = Array.from({ length: 3 }).map((_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (2 - i), 1)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        const label = d.toLocaleString('fr-FR', { month: 'short', year: 'numeric' })
        return { label, value: monthlyCount[key] || 0 }
      })

      res.json(lastThree)
    } catch (error) {
      console.error('❌ Erreur monthly-stats (DB):', error)
      res.status(500).json({ error: 'Erreur récupération stats mensuelles' })
    }
  }) as RequestHandler
)


// ======================================================
// 🔹 Recently played (format identique à Spotify API)
// ======================================================
spotifyController.get(
  '/recently-played',
  requireAuth,
  requireSpotifyUser,
  (async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id
      if (!userId) {
        res.status(401).json({ error: 'Utilisateur non authentifié' })
        return
      }

      const limit = Number(req.query.limit) || 50

      const history = await userHistoryRepository.find({
        where: { user: { id: userId } },
        order: { playedAt: 'DESC' },
        take: limit,
      })

      const items = history.map((h) => ({
  played_at: h.playedAt,
  track: {
    id: h.trackId,
    name: h.trackName,
    artists: [{ name: h.artistName }],
    duration_ms: h.durationMs, // ✅ Ajout durée
  },
  device: {
    type: h.deviceType || "Inconnu", // ✅ Ajout type d’appareil
    name: h.deviceName || null,      // ✅ Ajout nom appareil
  },
}))

      res.json({ items })
      return
    } catch (error) {
      console.error('❌ Erreur recently-played (DB):', error)
      res.status(500).json({ error: 'Erreur titres récemment joués' })
      return
    }
  }) as RequestHandler
)



// ======================================================
// 🔹 Compare entre 3 utilisateurs
// ======================================================
spotifyController.get(
  '/compare',
  requireAuth,
  requireSpotifyUser,
  (async (_req: Request, res: Response): Promise<void> => {
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

      res.json({
        users: users.map((u) => u.displayName || u.email),
      })
      return
    } catch {
      res
        .status(500)
        .json({ error: 'Erreur comparaison utilisateurs' })
      return
    }
  }) as RequestHandler
)

// ======================================================
// 🔹 Devices (appareils actifs Spotify)
// ======================================================
spotifyController.get(
  "/devices",
  requireAuth,
  requireSpotifyUser,
  (async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Utilisateur non authentifié" });
        return;
      }

      const user = await userRepository.findOneBy({ id: userId });
      if (!user) {
        res.status(404).json({ error: "Utilisateur introuvable" });
        return;
      }

      const token = await getValidAccessToken(user);
      const response = await axios.get("https://api.spotify.com/v1/me/player/devices", {
        headers: { Authorization: `Bearer ${token}` },
      });

      res.json(response.data.devices || []);
      return;
    } catch (error: any) {
      console.error("❌ Erreur /spotify/devices:", error.response?.data || error.message);
      res.status(500).json({ error: "Impossible de récupérer les appareils Spotify" });
      return;
    }
  }) as RequestHandler
);

//DAILY-STATS
spotifyController.get(
  "/daily-stats",
  requireAuth,
  requireSpotifyUser,
  (async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: "Utilisateur non authentifié" });
        return;
      }

      const stats = await getDailyStats(userId, 7);
      res.json(stats); // { labels: [...], values: [...] }
    } catch (err) {
      console.error("❌ Erreur daily-stats :", err);
      res.status(500).json({ error: "Erreur récupération daily stats" });
    }
  }) as RequestHandler
);

// ======================================================
// 🔹 Badges utilisateur (dynamiques + admin + système)
// ======================================================
spotifyController.get(
  '/badges',
  requireAuth,
  requireSpotifyUser,
  (async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id
      if (!userId) {
        res.status(401).json({ error: 'Utilisateur non authentifié' })
        return
      }

      // 🎯 1. Générer les badges débloqués par cet utilisateur
      const unlocked = await generateBadges(userId)

      // 🎯 2. Charger tous les badges existants (admin + système)
      const allBadges = await getAllBadgeDefinitions()

      // 🎯 3. Réponse complète
      res.json({
        unlocked,      // Liste des labels débloqués
        allBadges,     // Liste complète des badges possibles
      })
    } catch (error) {
      console.error('❌ Erreur /spotify/badges:', error)
      res.status(500).json({ error: 'Erreur lors du chargement des badges' })
    }
  }) as RequestHandler,
)




// ======================================================
// 🔹 Rafraîchir un access_token avec refresh_token
// ======================================================
spotifyController.post('/refresh', (async (
  req: Request,
  res: Response
): Promise<void> => {
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
      }
    )

    res.json(response.data)
    return
  } catch {
    res
      .status(500)
      .json({
        error: 'Erreur rafraîchissement token Spotify',
      })
    return
  }
}) as RequestHandler)

export default spotifyController
