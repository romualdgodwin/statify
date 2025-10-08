import { Router, Request, Response } from "express";
import { AppDataSource } from "../../dataSource";
import { User } from "./userEntity";
import { requireAuth, requireAdmin } from "../auth/authMiddleware";
import bcrypt from "bcryptjs";

const userRouter = Router();
const userRepository = AppDataSource.getRepository(User);

// ======================================================
// 🔹 Route publique simple
// ======================================================
userRouter.get("/public", (_req: Request, res: Response) => {
  res.json({ message: "Cette route est publique 🚀" });
});

// ======================================================
// 🔹 Liste publique des utilisateurs (⚠️ attention, version démo)
// ======================================================
userRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const users = await userRepository.find({
      select: ["id", "email", "role", "createdAt", "updatedAt"], // pas de password
    });
    res.json(users);
  } catch (error) {
    console.error("❌ Erreur user/:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ======================================================
// 🔹 Récupérer le profil de l’utilisateur connecté
// ======================================================
userRouter.get("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Utilisateur non authentifié" });
      return;
    }

    const user = await userRepository.findOne({
      where: { id: userId },
      select: ["id", "email", "role", "createdAt", "updatedAt"],
    });

    if (!user) {
      res.status(404).json({ error: "Utilisateur non trouvé" });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error("❌ Erreur user/me:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ======================================================
// 🔹 CRUD réservé aux admins
// ======================================================

// 📌 Lire tous les utilisateurs
userRouter.get("/all", requireAdmin, async (_req: Request, res: Response) => {
  try {
    const users = await userRepository.find({
      select: ["id", "email", "role", "createdAt", "updatedAt"],
    });
    res.json(users);
  } catch (error) {
    console.error("❌ Erreur user/all:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 📌 Créer un utilisateur
userRouter.post("/", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email et mot de passe requis" });
      return;
    }

    const existing = await userRepository.findOne({ where: { email } });
    if (existing) {
      res.status(400).json({ error: "Cet email est déjà utilisé" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = userRepository.create({
      email,
      password: hashedPassword,
      role: role || "user",
    });

    await userRepository.save(newUser);

    res.status(201).json({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt,
    });
  } catch (error) {
    console.error("❌ Erreur create user:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 📌 Mettre à jour un utilisateur
userRouter.put("/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { email, password, role } = req.body;

    const user = await userRepository.findOne({ where: { id } });
    if (!user) {
      res.status(404).json({ error: "Utilisateur non trouvé" });
      return;
    }

    if (email) user.email = email;
    if (role) user.role = role;
    if (password) user.password = await bcrypt.hash(password, 10);

    await userRepository.save(user);

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error("❌ Erreur update user:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// 📌 Supprimer un utilisateur
userRouter.delete("/:id", requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const result = await userRepository.delete(id);

    if (result.affected === 0) {
      res.status(404).json({ error: "Utilisateur non trouvé" });
      return;
    }

    res.json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    console.error("❌ Erreur delete user:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default userRouter;
