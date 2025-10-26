// server/src/modules/auth/authController.ts
import {
  Router,
  Request,
  Response,
  RequestHandler,
} from 'express'
import { AppDataSource } from '../../dataSource'
import { User } from '../user/userEntity'
import { createValidator } from 'express-joi-validation'
import Joi from 'joi'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const authController = Router()
export default authController

const validator = createValidator()
const userRepository = AppDataSource.getRepository(User)

// Clé secrète unique pour signer/vérifier le token
const JWT_SECRET =
  process.env.JWT_SECRET || 'dev_secret_key'

// ======================================================
// 📌 Validation schemas
// ======================================================
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
})

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
})

// ======================================================
// 📌 REGISTER (inscription classique → user uniquement)
// ======================================================
authController.post(
  '/register',
  validator.body(registerSchema),
  (async (req: Request, res: Response) => {
    const { email, password } = req.body

    try {
      // Vérifie si l'email existe déjà
      const existingUser = await userRepository.findOne({
        where: { email },
      })
      if (existingUser) {
        res
          .status(400)
          .json({
            error:
              'Un utilisateur existe déjà avec cet email',
          })
        return
      }

      // Hash du mot de passe
      const hashedPassword = await bcrypt.hash(password, 10)

      // Création utilisateur → rôle "user" forcé
      const newUser = userRepository.create({
        email,
        password: hashedPassword,
        role: 'user', // ⚠️ Empêche la création d’un admin par API publique
      })

      await userRepository.save(newUser)

      res
        .status(201)
        .json({ message: 'Utilisateur créé avec succès' })
    } catch (error) {
      console.error('❌ Erreur register:', error)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  }) as RequestHandler,
)

// ======================================================
// 📌 LOGIN (connexion admin ou user, via DB)
// ======================================================
authController.post(
  '/login',
  validator.body(loginSchema),
  (async (req: Request, res: Response) => {
    const { email, password } = req.body

    try {
      const user = await userRepository.findOne({
        where: { email },
      })

      if (!user || !user.password) {
        res
          .status(401)
          .json({
            error:
              'Utilisateur introuvable ou mot de passe manquant',
          })
        return
      }

      const isValid = await bcrypt.compare(
        password,
        user.password,
      )
      if (!isValid) {
        res
          .status(401)
          .json({ error: 'Mot de passe incorrect' })
        return
      }

      // ✅ On garde le rôle stocké en DB (admin ou user)
      const token = jwt.sign(
        { id: user.id, role: user.role, email: user.email },
        JWT_SECRET,
        { algorithm: 'HS256', expiresIn: '7d' },
      )

      res.json({
        type: 'classic', // ✅ différencie du type Spotify
        token,
        id: user.id,
        role: user.role,
        email: user.email,
      })
    } catch (error) {
      console.error('❌ Erreur login:', error)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  }) as RequestHandler,
)

// ======================================================
// 📌 ME (vérifier le token & récupérer l’utilisateur)
// ======================================================
authController.get('/me', (async (
  req: Request,
  res: Response,
) => {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    res.status(401).json({ error: 'Token manquant' })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      id: number
      role: string
    }

    const user = await userRepository.findOne({
      where: { id: payload.id },
    })
    if (!user) {
      res
        .status(404)
        .json({ error: 'Utilisateur non trouvé' })
      return
    }

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
    })
  } catch (error) {
    res
      .status(401)
      .json({ error: 'Token invalide ou expiré' })
  }
}) as RequestHandler)
