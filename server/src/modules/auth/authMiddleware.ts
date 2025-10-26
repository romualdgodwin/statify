// server/src/modules/auth/authMiddleware.ts
import { Request, RequestHandler } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET =
  process.env.JWT_SECRET || 'dev_secret_key'

// ======================================================
// Typage custom pour enrichir Request avec user
// ======================================================
export interface AuthRequest extends Request {
  user?: {
    id: number
    role: string
    displayName?: string
    email?: string
    spotifyId?: string
  }
}

// ======================================================
// ✅ Middleware requireAuth : utilisateur connecté (JWT valide)
// ======================================================
export const requireAuth: RequestHandler = (
  req,
  res,
  next,
) => {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    res.status(401).json({ error: 'Token manquant' })
    return
  }

  const token = authHeader.split(' ')[1]
  if (!token) {
    res.status(401).json({ error: 'Token manquant' })
    return
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    ;(req as AuthRequest).user = decoded
    next()
  } catch {
    res
      .status(403)
      .json({ error: 'Token invalide ou expiré' })
  }
}

// ======================================================
// ✅ Middleware requireAdmin : accès réservé aux admins
// ======================================================
export const requireAdmin: RequestHandler = (
  req,
  res,
  next,
) => {
  const user = (req as AuthRequest).user
  if (!user) {
    res
      .status(401)
      .json({ error: 'Utilisateur non authentifié' })
    return
  }

  if (user.role !== 'admin') {
    res
      .status(403)
      .json({ error: 'Accès réservé aux administrateurs' })
    return
  }

  next()
}

// ======================================================
// ✅ Middleware requireSpotifyUser : accès réservé aux logins Spotify
// ======================================================
export const requireSpotifyUser: RequestHandler = (
  req,
  res,
  next,
) => {
  const user = (req as AuthRequest).user
  if (!user) {
    res
      .status(401)
      .json({ error: 'Utilisateur non authentifié' })
    return
  }

  // On exige à la fois un rôle "user" ET un spotifyId
  if (user.role !== 'user' || !user.spotifyId) {
    res
      .status(403)
      .json({
        error: 'Accès réservé aux utilisateurs Spotify',
      })
    return
  }

  next()
}
