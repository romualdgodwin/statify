// server/src/modules/admin/adminController.ts
import {
  Router,
  Request,
  Response,
  RequestHandler,
} from 'express'
import { AppDataSource } from '../../dataSource'
import { User } from '../user/userEntity'
import { UserHistory } from '../../userHistory/userHistoryEntity'
import { generateBadges } from '../../services/badgeService'
import { MoreThan, LessThan } from 'typeorm'
import { refreshSpotifyData } from '../../services/spotifySyncService'
import { requireAuth, requireAdmin } from '../auth/authMiddleware'

const adminController = Router()

// ✅ On applique d'abord requireAuth puis requireAdmin
adminController.use(requireAuth as RequestHandler)
adminController.use(requireAdmin as RequestHandler)

// ======================================================
// 1. Stats utilisateurs
// ======================================================
adminController.get(
  '/stats/users',
  (async (_req: Request, res: Response) => {
    try {
      const userRepo = AppDataSource.getRepository(User)
      const totalUsers = await userRepo.count()

      const lastMonth = new Date()
      lastMonth.setDate(lastMonth.getDate() - 30)

      const activeUsers = await userRepo.count({
        where: { lastLogin: MoreThan(lastMonth) },
      })

      res.json({ totalUsers, activeUsers })
    } catch (err) {
      console.error('❌ Erreur /admin/stats/users:', err)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  }) as RequestHandler,
)

// ======================================================
// 2. Nombre total de morceaux
// ======================================================
adminController.get(
  '/stats/plays',
  (async (_req: Request, res: Response) => {
    try {
      const historyRepo = AppDataSource.getRepository(UserHistory)
      const totalPlays = await historyRepo.count()
      res.json({ totalPlays })
    } catch (err) {
      console.error('❌ Erreur /admin/stats/plays:', err)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  }) as RequestHandler,
)

// ======================================================
// 3. Stats sur les badges
// ======================================================
adminController.get(
  '/stats/badges',
  (async (_req: Request, res: Response) => {
    try {
      const userRepo = AppDataSource.getRepository(User)
      const users = await userRepo.find()

      const badgeCount: Record<string, number> = {}
      for (const user of users) {
        const userBadges = await generateBadges(user.id)
        userBadges.forEach((b) => {
          badgeCount[b] = (badgeCount[b] || 0) + 1
        })
      }
      res.json({ badgeCount })
    } catch (err) {
      console.error('❌ Erreur /admin/stats/badges:', err)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  }) as RequestHandler,
)

// ======================================================
// 4. Forcer la synchro Spotify d’un utilisateur
// ======================================================
adminController.post(
  '/refresh/:id',
  (async (req: Request, res: Response) => {
    try {
      const userRepo = AppDataSource.getRepository(User)
      const user = await userRepo.findOneBy({
        id: parseInt(req.params.id),
      })

      if (!user) {
        res.status(404).json({ error: 'Utilisateur introuvable' })
        return
      }

      await refreshSpotifyData(user)
      res.json({
        success: true,
        message: 'Synchronisation Spotify forcée',
      })
    } catch (err) {
      console.error('❌ Erreur /admin/refresh/:id:', err)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  }) as RequestHandler,
)
// ======================================================
// 6. CRUD Badges (admin only)
// ======================================================
import { Badge } from '../badge/badgeEntity' // ⚠️ Assure-toi d'avoir créé l'entité Badge

// 📌 Récupérer tous les badges
adminController.get(
  '/badges',
  (async (_req: Request, res: Response) => {
    try {
      const badgeRepo = AppDataSource.getRepository(Badge)
      const badges = await badgeRepo.find()
      res.json({ badges })
    } catch (err) {
      console.error('❌ Erreur /admin/badges GET:', err)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  }) as RequestHandler,
)

// 📌 Créer un badge
adminController.post(
  '/badges',
  (async (req: Request, res: Response) => {
    try {
      const { label, description, icon } = req.body
      if (!label || !description) {
        res.status(400).json({ error: 'Label et description requis' })
        return
      }

      const badgeRepo = AppDataSource.getRepository(Badge)
      const newBadge = badgeRepo.create({
        label,
        description,
        icon: icon || '🏅',
        isCustom: true,
      })
      await badgeRepo.save(newBadge)

      res.status(201).json(newBadge)
    } catch (err) {
      console.error('❌ Erreur /admin/badges POST:', err)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  }) as RequestHandler,
)

// 📌 Modifier un badge
adminController.put(
  '/badges/:id',
  (async (req: Request, res: Response) => {
    try {
      const badgeRepo = AppDataSource.getRepository(Badge)
      const badge = await badgeRepo.findOneBy({ id: parseInt(req.params.id) })

      if (!badge) {
        res.status(404).json({ error: 'Badge introuvable' })
        return
      }

      Object.assign(badge, req.body)
      await badgeRepo.save(badge)
      res.json(badge)
    } catch (err) {
      console.error('❌ Erreur /admin/badges PUT:', err)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  }) as RequestHandler,
)

// 📌 Supprimer un badge
adminController.delete(
  '/badges/:id',
  (async (req: Request, res: Response) => {
    try {
      const badgeRepo = AppDataSource.getRepository(Badge)
      const result = await badgeRepo.delete(parseInt(req.params.id))

      if (result.affected === 0) {
        res.status(404).json({ error: 'Badge introuvable' })
        return
      }

      res.json({ success: true, message: 'Badge supprimé' })
    } catch (err) {
      console.error('❌ Erreur /admin/badges DELETE:', err)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  }) as RequestHandler,
)


// ======================================================
// 5. Voir tokens expirés
// ======================================================
adminController.get(
  '/tokens/expired',
  (async (_req: Request, res: Response) => {
    try {
      const userRepo = AppDataSource.getRepository(User)
      const expired = await userRepo.find({
        where: { spotifyTokenExpiry: LessThan(new Date()) },
      })
      res.json({ expired })
    } catch (err) {
      console.error('❌ Erreur /admin/tokens/expired:', err)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  }) as RequestHandler,
)

// 📌 Récupérer tous les badges
adminController.get(
  '/badges',
  (async (_req: Request, res: Response) => {
    try {
      const badgeRepo = AppDataSource.getRepository(Badge)
      const badges = await badgeRepo.find()
      res.json(badges) // ✅ On renvoie directement le tableau
    } catch (err) {
      console.error('❌ Erreur /admin/badges GET:', err)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  }) as RequestHandler,
)


export default adminController
