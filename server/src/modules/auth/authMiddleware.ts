// server/src/modules/auth/authMiddleware.ts
import { Request, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  throw new Error("❌ JWT_SECRET manquant dans le fichier .env");
}
const JWT_SECRET = process.env.JWT_SECRET;

export interface AuthUser {
  id: number;
  role: string;
  displayName?: string;
  email?: string;
  spotifyId?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

// ======================================================
// ✅ Helper : récupérer l'utilisateur depuis req
// ======================================================
export function getUserFromRequest(req: Request): AuthUser | undefined {
  return (req as AuthRequest).user;
}

// ======================================================
// ✅ Vérifie qu’un utilisateur est connecté (JWT interne)
// ======================================================
export const requireAuth: RequestHandler = (req, res, next): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'Authorization header manquant' });
    return;
  }
  

  const token = authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'Token manquant' });
    return;
  }
  console.log("🔑 Vérification du token:", token, "SECRET utilisé:", JWT_SECRET);

  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as AuthUser;

    if (!decoded?.id) {
      res.status(401).json({ error: 'Token invalide (payload manquant)' });
      return;
    }

    (req as AuthRequest).user = decoded;
    next();
  } catch (err) {
    console.error("❌ Erreur vérification JWT:", err);
    res.status(403).json({ error: 'Token invalide ou expiré' });
  }
};

// ======================================================
// ✅ Vérifie que l’utilisateur est admin
// ======================================================
export const requireAdmin: RequestHandler = (req, res, next): void => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Utilisateur non authentifié' });
    return;
  }
  if (user.role !== 'admin') {
    res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    return;
  }
  next();
};

// ======================================================
// ✅ Vérifie que l’utilisateur est un "Spotify user" ou local
// ======================================================
export const requireSpotifyUser: RequestHandler = (req, res, next): void => {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Utilisateur non authentifié' });
    return;
  }

  if (user.spotifyId || user.role === 'user' || user.role === 'admin') {
    next();
    return;
  }

  res.status(403).json({ error: 'Accès réservé aux utilisateurs authentifiés' });
};
