// server/src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// 🔑 Clé secrète unique, doit être la même que dans authController
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key";

// ======================================================
// 🔹 Typage du payload JWT
// ======================================================
export interface AuthPayload extends JwtPayload {
  id: number;
  role: string;
  email?: string;
}

// ======================================================
// 🔹 Extension de Express.Request pour ajouter req.user
// ======================================================
declare module "express-serve-static-core" {
  interface Request {
    user?: AuthPayload;
  }
}

// ======================================================
// 🔹 Middleware générique pour extraire le token
// ======================================================
function extractUserFromToken(req: Request, res: Response): AuthPayload | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: "Token manquant" });
    return null;
  }

  const token = authHeader.split(" ")[1];
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch {
    res.status(401).json({ error: "Token invalide ou expiré" });
    return null;
  }
}

// ======================================================
// 🔹 Vérifier que l’utilisateur est authentifié
// ======================================================
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const decoded = extractUserFromToken(req, res);
  if (!decoded) return;

  req.user = decoded; // ✅ req.user typé
  next();
};

// ======================================================
// 🔹 Vérifier que l’utilisateur est admin
// ======================================================
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const decoded = extractUserFromToken(req, res);
  if (!decoded) return;

  if (decoded.role !== "admin") {
    res.status(403).json({ error: "Accès réservé aux administrateurs" });
    return;
  }

  req.user = decoded; // ✅ req.user typé
  next();
};
