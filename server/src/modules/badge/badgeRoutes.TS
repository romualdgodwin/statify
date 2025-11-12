import { Router, Request, Response } from 'express'
import { AppDataSource } from '../../dataSource'
import { Badge } from './badgeEntity'
import { requireAdmin, requireAuth } from '../auth/authMiddleware'
import { getAllBadgeDefinitions } from '../../services/badgeService'

const badgeRouter = Router()
const badgeRepo = AppDataSource.getRepository(Badge)


//  Route publique : liste complète (système + admin)

badgeRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const allBadges = await getAllBadgeDefinitions()
    res.json(allBadges)
  } catch (error) {
    console.error('❌ Erreur GET /badges:', error)
    res.status(500).json({ error: 'Erreur lors du chargement des badges' })
  }
})


//  Routes Admin uniquement
//  Récupérer tous les badges de la BDD
badgeRouter.get('/admin/badges', requireAuth, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const badges = await badgeRepo.find()
    res.json(badges)
  } catch (error) {
    console.error('❌ Erreur GET /admin/badges:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

//  Ajouter un badge personnalisé
badgeRouter.post('/admin/badges', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { label, description, icon } = req.body
    if (!label || !description) {
      res.status(400).json({ error: 'Label et description requis' })
      return
    }

    const newBadge = badgeRepo.create({
      label,
      description,
      icon: icon || '🏅',
      isCustom: true,
    })

    await badgeRepo.save(newBadge)
    res.status(201).json(newBadge)
  } catch (error) {
    console.error('❌ Erreur POST /admin/badges:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

//  Modifier un badge personnalisé
badgeRouter.put('/admin/badges/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    const { label, description, icon } = req.body

    const badge = await badgeRepo.findOne({ where: { id } })
    if (!badge) {
      res.status(404).json({ error: 'Badge non trouvé' })
      return
    }

    badge.label = label ?? badge.label
    badge.description = description ?? badge.description
    badge.icon = icon ?? badge.icon

    await badgeRepo.save(badge)
    res.json(badge)
  } catch (error) {
    console.error('❌ Erreur PUT /admin/badges/:id:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

//  Supprimer un badge personnalisé
badgeRouter.delete('/admin/badges/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    const result = await badgeRepo.delete(id)

    if (result.affected === 0) {
      res.status(404).json({ error: 'Badge non trouvé' })
      return
    }

    res.json({ message: 'Badge supprimé avec succès' })
  } catch (error) {
    console.error('❌ Erreur DELETE /admin/badges/:id:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

export default badgeRouter
