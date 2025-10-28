// server/src/modules/user/userRoutes.ts
import {
  Router,
  Request,
  Response,
  RequestHandler,
} from 'express'
import { AppDataSource } from '../../dataSource'
import { User } from './userEntity'
import { UserHistory } from '../../userHistory/userHistoryEntity'
import {
  requireAuth,
  requireAdmin,
} from '../auth/authMiddleware'
import bcrypt from 'bcryptjs'
import axios from 'axios'

const userRouter = Router()
const userRepository = AppDataSource.getRepository(User)
const historyRepository = AppDataSource.getRepository(UserHistory)

// ======================================================
// 🔹 Helper pour récupérer le token
// ======================================================
function getSpotifyToken(req: Request): string | null {
  const token = req.headers.authorization?.split(' ')[1]
  return token || null
}

// ======================================================
// 🔹 Route publique simple
// ======================================================
userRouter.get(
  '/public',
  ((_req: Request, res: Response): void => {
    res.json({ message: 'Cette route est publique 🚀' })
  }) as RequestHandler,
)

// ======================================================
// 🔹 Liste publique des utilisateurs
// ======================================================
userRouter.get(
  '/',
  (async (_req: Request, res: Response): Promise<void> => {
    try {
      const users = await userRepository.find({
        select: ['id', 'email', 'role', 'createdAt', 'updatedAt'],
      })
      res.json(users)
      return
    } catch (error) {
      console.error('❌ Erreur user/:', error)
      res.status(500).json({ error: 'Erreur serveur' })
      return
    }
  }) as RequestHandler,
)

// ======================================================
// 🔹 Profil de l’utilisateur connecté
// ======================================================
userRouter.get(
  '/me',
  requireAuth,
  (async (req: any, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id
      if (!userId) {
        res.status(401).json({ error: 'Utilisateur non authentifié' })
        return
      }

      const user = await userRepository.findOne({
        where: { id: userId },
        select: ['id', 'email', 'role', 'createdAt', 'updatedAt'],
      })

      if (!user) {
        res.status(404).json({ error: 'Utilisateur non trouvé' })
        return
      }

      res.json(user)
      return
    } catch (error) {
      console.error('❌ Erreur user/me:', error)
      res.status(500).json({ error: 'Erreur serveur' })
      return
    }
  }) as RequestHandler,
)

// ======================================================
// 🔹 Historique utilisateur
// ======================================================
userRouter.get(
  '/:id/history',
  requireAuth,
  (async (req: any, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id)
      const history = await historyRepository.find({
        where: { user: { id } },
        order: { playedAt: 'DESC' },
      })
      res.json({ success: true, data: history })
      return
    } catch (error) {
      console.error('❌ Erreur get history:', error)
      res.status(500).json({ success: false, message: 'Erreur serveur' })
      return
    }
  }) as RequestHandler,
)

userRouter.post(
  '/:id/history',
  requireAuth,
  (async (req: any, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id)
      const { trackName, artistName, playedAt } = req.body

      if (!trackName || !artistName || !playedAt) {
        res.status(400).json({
          success: false,
          message: 'Champs manquants',
        })
        return
      }

      const newHistory = historyRepository.create({
        trackName,
        artistName,
        playedAt: new Date(playedAt),
        user: { id } as any,
      })

      await historyRepository.save(newHistory)
      res.status(201).json({ success: true, data: newHistory })
      return
    } catch (error) {
      console.error('❌ Erreur add history:', error)
      res.status(500).json({ success: false, message: 'Erreur serveur' })
      return
    }
  }) as RequestHandler,
)

userRouter.post(
  '/:id/sync-history',
  requireAuth,
  (async (req: any, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id)
      const token = getSpotifyToken(req)

      if (!token) {
        res.status(401).json({ error: 'Token Spotify manquant' })
        return
      }

      const response = await axios.get(
        'https://api.spotify.com/v1/me/player/recently-played?limit=50',
        { headers: { Authorization: `Bearer ${token}` } },
      )

      const plays = response.data.items
      let inserted = 0

      for (const play of plays) {
        const trackName = play.track.name
        const artistName = play.track.artists.map((a: any) => a.name).join(', ')
        const playedAt = new Date(play.played_at)

        const exists = await historyRepository.findOne({
          where: { user: { id }, trackName, artistName, playedAt },
        })

        if (!exists) {
          const newHistory = historyRepository.create({
            trackName,
            artistName,
            playedAt,
            user: { id } as any,
          })
          await historyRepository.save(newHistory)
          inserted++
        }
      }

      res.json({
        success: true,
        message: `✅ ${inserted} nouvelles écoutes ajoutées`,
      })
      return
    } catch (error: any) {
      console.error('❌ Erreur sync history:', error.response?.data || error.message)
      res.status(500).json({ success: false, message: 'Erreur lors de la synchro Spotify' })
      return
    }
  }) as RequestHandler,
)

// ======================================================
// 🔹 CRUD réservé aux admins
// ======================================================
userRouter.get(
  '/all',
  requireAuth,
  requireAdmin,
  (async (_req: Request, res: Response): Promise<void> => {
    try {
      const users = await userRepository.find({
        select: ['id', 'email', 'role', 'createdAt', 'updatedAt'],
      })
      res.json(users)
      return
    } catch (error) {
      console.error('❌ Erreur user/all:', error)
      res.status(500).json({ error: 'Erreur serveur' })
      return
    }
  }) as RequestHandler,
)

userRouter.post(
  '/',
  requireAuth,
  requireAdmin,
  (async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, role } = req.body

      if (!email || !password) {
        res.status(400).json({ error: 'Email et mot de passe requis' })
        return
      }

      const existing = await userRepository.findOne({ where: { email } })
      if (existing) {
        res.status(400).json({ error: 'Cet email est déjà utilisé' })
        return
      }

      const hashedPassword = await bcrypt.hash(password, 10)
      const newUser = userRepository.create({
        email,
        password: hashedPassword,
        role: role || 'user',
      })

      await userRepository.save(newUser)

      res.status(201).json({
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
      })
      return
    } catch (error) {
      console.error('❌ Erreur create user:', error)
      res.status(500).json({ error: 'Erreur serveur' })
      return
    }
  }) as RequestHandler,
)

userRouter.put(
  '/:id',
  requireAuth,
  requireAdmin,
  (async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id)
      const { email, password, role } = req.body

      const user = await userRepository.findOne({ where: { id } })
      if (!user) {
        res.status(404).json({ error: 'Utilisateur non trouvé' })
        return
      }

      if (email) user.email = email
      if (role) user.role = role
      if (password) user.password = await bcrypt.hash(password, 10)

      await userRepository.save(user)

      res.json({
        id: user.id,
        email: user.email,
        role: user.role,
        updatedAt: user.updatedAt,
      })
      return
    } catch (error) {
      console.error('❌ Erreur update user:', error)
      res.status(500).json({ error: 'Erreur serveur' })
      return
    }
  }) as RequestHandler,
)

userRouter.delete(
  '/:id',
  requireAuth,
  requireAdmin,
  (async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id)
      const result = await userRepository.delete(id)

      if (result.affected === 0) {
        res.status(404).json({ error: 'Utilisateur non trouvé' })
        return
      }

      res.json({ message: 'Utilisateur supprimé avec succès' })
      return
    } catch (error) {
      console.error('❌ Erreur delete user:', error)
      res.status(500).json({ error: 'Erreur serveur' })
      return
    }
  }) as RequestHandler,
)

export default userRouter
