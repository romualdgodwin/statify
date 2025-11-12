import { Request, Response, RequestHandler } from 'express'
import { UserService } from './userService'
import { AppDataSource } from '../../dataSource'
import { UserHistory } from '../../userHistory/userHistoryEntity'
import bcrypt from 'bcryptjs'

const userService = new UserService()
const historyRepository =
  AppDataSource.getRepository(UserHistory)

export class UserController {

  //  Récupérer tous les utilisateurs (admin)

  static getUsers: RequestHandler = async (
    _req: Request,
    res: Response,
  ) => {
    try {
      const users = await userService.findAll()
      res.json({ success: true, data: users })
    } catch (error) {
      console.error('❌ Error getUsers:', error)
      res
        .status(500)
        .json({ success: false, message: 'Erreur serveur' })
    }
  }


  //  Récupérer un utilisateur par ID

  static getUserById: RequestHandler = async (
    req: Request,
    res: Response,
  ) => {
    try {
      const id = parseInt(req.params.id, 10)
      if (isNaN(id)) {
        res
          .status(400)
          .json({ success: false, message: 'ID invalide' })
        return
      }

      const user = await userService.findById(id)
      if (!user) {
        res
          .status(404)
          .json({
            success: false,
            message: 'Utilisateur non trouvé',
          })
        return
      }

      res.json({ success: true, data: user })
    } catch (error) {
      console.error('❌ Error getUserById:', error)
      res
        .status(500)
        .json({ success: false, message: 'Erreur serveur' })
    }
  }

  //  Créer un utilisateur (admin)

  static createUser: RequestHandler = async (
    req: Request,
    res: Response,
  ) => {
    try {
      const { email, password, role } = req.body

      if (!email || !password) {
        res
          .status(400)
          .json({
            success: false,
            message: 'Email et mot de passe requis',
          })
        return
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      const newUser = await userService.create({
        email,
        password: hashedPassword,
        role: role || 'user',
      })

      res.status(201).json({ success: true, data: newUser })
    } catch (error) {
      console.error('❌ Error createUser:', error)
      res
        .status(500)
        .json({ success: false, message: 'Erreur serveur' })
    }
  }


  //  Mettre à jour un utilisateur (admin)

  static updateUser: RequestHandler = async (
    req: Request,
    res: Response,
  ) => {
    try {
      const id = parseInt(req.params.id, 10)
      if (isNaN(id)) {
        res
          .status(400)
          .json({ success: false, message: 'ID invalide' })
        return
      }

      const { email, password, role } = req.body
      const dataToUpdate: any = {}

      if (email) dataToUpdate.email = email
      if (role) dataToUpdate.role = role
      if (password) {
        dataToUpdate.password = await bcrypt.hash(
          password,
          10,
        )
      }

      const updatedUser = await userService.update(
        id,
        dataToUpdate,
      )

      if (!updatedUser) {
        res
          .status(404)
          .json({
            success: false,
            message: 'Utilisateur non trouvé',
          })
        return
      }

      res.json({ success: true, data: updatedUser })
    } catch (error) {
      console.error('❌ Error updateUser:', error)
      res
        .status(500)
        .json({ success: false, message: 'Erreur serveur' })
    }
  }

  // Supprimer un utilisateur (admin)

  static deleteUser: RequestHandler = async (
    req: Request,
    res: Response,
  ) => {
    try {
      const id = parseInt(req.params.id, 10)
      if (isNaN(id)) {
        res
          .status(400)
          .json({ success: false, message: 'ID invalide' })
        return
      }

      const deleted = await userService.delete(id)

      if (!deleted) {
        res
          .status(404)
          .json({
            success: false,
            message: 'Utilisateur non trouvé',
          })
        return
      }

      res.status(204).send() 
    } catch (error) {
      console.error('❌ Error deleteUser:', error)
      res
        .status(500)
        .json({ success: false, message: 'Erreur serveur' })
    }
  }


  //  Récupérer l’historique d’un utilisateur

  static getUserHistory: RequestHandler = async (
    req: Request,
    res: Response,
  ) => {
    try {
      const id = parseInt(req.params.id, 10)
      if (isNaN(id)) {
        res
          .status(400)
          .json({ success: false, message: 'ID invalide' })
        return
      }

      const history = await historyRepository.find({
        where: { user: { id } },
        order: { playedAt: 'DESC' },
      })

      res.json({ success: true, data: history })
    } catch (error) {
      console.error('❌ Error getUserHistory:', error)
      res
        .status(500)
        .json({ success: false, message: 'Erreur serveur' })
    }
  }


  // Ajouter une écoute manuellement (utile pour tests)

  static addUserHistory: RequestHandler = async (
    req: Request,
    res: Response,
  ) => {
    try {
      const { userId, trackName, artistName, playedAt } =
        req.body

      if (
        !userId ||
        !trackName ||
        !artistName ||
        !playedAt
      ) {
        res
          .status(400)
          .json({
            success: false,
            message: 'Données manquantes',
          })
        return
      }

      const history = historyRepository.create({
        trackName,
        artistName,
        playedAt: new Date(playedAt),
        user: { id: userId } as any,
      })

      await historyRepository.save(history)

      res.status(201).json({ success: true, data: history })
    } catch (error) {
      console.error('❌ Error addUserHistory:', error)
      res
        .status(500)
        .json({ success: false, message: 'Erreur serveur' })
    }
  }
}
