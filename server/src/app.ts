// server/src/app.ts
import express from "express";
import "reflect-metadata";
import userRouter from "./modules/user/userRoute";
import { errorMiddleware } from "./middlewares/error.middleware";
import authController from "./modules/auth/authController";
import spotifyController from "./modules/spotify/spotifyController";

const app = express();

app.use(express.json());

// ==========================
// 📌 Routes principales
// ==========================
app.use("/api/users", userRouter);
app.use("/api/auth", authController);
app.use("/api/spotify", spotifyController);

// ==========================
// 📌 Middleware global d’erreur
// ==========================
app.use(errorMiddleware);

export default app;
