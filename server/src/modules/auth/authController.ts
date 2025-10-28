// server/src/modules/auth/authController.ts
import { Router, Request, Response, RequestHandler } from 'express';
import { AppDataSource } from '../../dataSource';
import { User } from '../user/userEntity';
import { createValidator } from 'express-joi-validation';
import Joi from 'joi';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const authController = Router();
export default authController;

const validator = createValidator();
const userRepository = AppDataSource.getRepository(User);

// ✅ Clé secrète prise uniquement depuis .env
if (!process.env.JWT_SECRET) {
  throw new Error("❌ JWT_SECRET manquant dans le fichier .env");
}
const JWT_SECRET = process.env.JWT_SECRET;

// ======================================================
// 📌 Validation schemas
// ======================================================
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// ======================================================
// 📌 REGISTER (inscription classique → user uniquement)
// ======================================================
authController.post(
  '/register',
  validator.body(registerSchema),
  (async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    try {
      const existingUser = await userRepository.findOne({ where: { email } });
      if (existingUser) {
        res.status(400).json({ success: false, error: 'Un utilisateur existe déjà avec cet email' });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = userRepository.create({
        email,
        password: hashedPassword,
        role: 'user', // ⚠️ Empêche la création d’un admin via API publique
      });

      await userRepository.save(newUser);

      res.status(201).json({ success: true, message: 'Utilisateur créé avec succès' });
    } catch (error) {
      console.error('❌ Erreur register:', error);
      res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
  }) as RequestHandler,
);

// ======================================================
// 📌 LOGIN (connexion admin ou user, via DB)
// ======================================================
authController.post(
  '/login',
  validator.body(loginSchema),
  (async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    try {
      const user = await userRepository.findOne({
        where: { email },
        select: ['id', 'email', 'password', 'role', 'displayName', 'spotifyId'],
      });

      if (!user || !user.password) {
        res.status(401).json({ success: false, error: 'Utilisateur introuvable ou mot de passe manquant' });
        return;
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        res.status(401).json({ success: false, error: 'Mot de passe incorrect' });
        return;
      }

      const token = jwt.sign(
        {
          id: user.id,
          role: user.role,
          email: user.email,
          displayName: user.displayName,
          spotifyId: user.spotifyId,
        },
        JWT_SECRET,
        { algorithm: 'HS256', expiresIn: '7d' },
      );

      res.json({
        success: true,
        type: 'classic',
        token,
        id: user.id,
        role: user.role,
        email: user.email,
        displayName: user.displayName,
        spotifyId: user.spotifyId,
      });
    } catch (error) {
      console.error('❌ Erreur login:', error);
      res.status(500).json({ success: false, error: 'Erreur serveur' });
    }
  }) as RequestHandler,
);

// ======================================================
// 📌 ME (vérifier le token & récupérer l’utilisateur)
// ======================================================
authController.get(
  '/me',
  (async (req: Request, res: Response): Promise<void> => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ success: false, error: 'Token manquant' });
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = jwt.verify(token, JWT_SECRET) as { id: number };

      const user = await userRepository.findOne({
        where: { id: payload.id },
        select: ['id', 'email', 'role', 'displayName', 'spotifyId'],
      });

      if (!user) {
        res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
        return;
      }

      res.json({
        success: true,
        id: user.id,
        email: user.email,
        role: user.role,
        displayName: user.displayName,
        spotifyId: user.spotifyId,
      });
    } catch (error) {
      console.error("❌ Erreur vérification token:", error);
      res.status(401).json({ success: false, error: 'Token invalide ou expiré' });
    }
  }) as RequestHandler,
);
