// ✅ Charger les variables d'environnement dès le tout début
import 'dotenv/config';
import 'reflect-metadata';

import express from 'express';
import cors from 'cors';
import cron from 'node-cron';

import { AppDataSource } from './dataSource';
import { User } from './modules/user/userEntity';
import userRouter from './modules/user/userRoute';
import authController from './modules/auth/authController';
import spotifyController from './modules/spotify/spotifyController';
import adminController from './modules/admin/adminController';
import { syncSpotifyHistory } from './services/spotifySyncService';
import { getValidAccessToken } from './utils/spotifyTokenManager';
import { seedDatabase } from './config/seed';
import { ErrorLog } from './modules/logs/errorLogEntity';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (_req, res) => {
  res.send('Plop!');
});

app.use('/users', userRouter);
app.use('/auth', authController);
app.use('/spotify', spotifyController);
app.use('/admin', adminController);

// ✅ Middleware global d’erreurs (4 arguments obligatoires)
app.use(async (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  try {
    const repo = AppDataSource.getRepository(ErrorLog);
    await repo.save({
      message: err.message ?? 'Unknown error',
      stack: err.stack ?? '',
    });
  } catch {
    // On ignore l'erreur de log pour éviter une boucle infinie
  }

  res.status(500).json({
    error: 'Erreur interne serveur',
  });
});

// Lancement du serveur après initialisation de la DB
const port: number = process.env.PORT ? Number(process.env.PORT) : 3000;

AppDataSource.initialize()
  .then(async () => {
    await seedDatabase();

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({
      where: { email: 'romualag@gmail.com' },
    });

    if (user?.spotifyRefreshToken) {
      await getValidAccessToken(user);
      console.log('🎵 Token Spotify rafraîchi au démarrage');
    }

    await syncSpotifyHistory();

    app.listen(port, () => {
      console.log(`✅ Server started at http://localhost:${port}`);
      console.log('🎵 SPOTIFY_REDIRECT_URI:', process.env.SPOTIFY_REDIRECT_URI);
    });

    // 🕒 CRON job : toutes les 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      console.log('⏰ CRON (5min) : synchro Spotify');
      await syncSpotifyHistory();
    });

    // 🌙 CRON job : tous les jours à 3h du matin
    cron.schedule('0 3 * * *', async () => {
      console.log('🌙 CRON (3h du matin) : synchro complète Spotify');
      await syncSpotifyHistory();
    });
  })
  .catch(() => {
    // ❌ On ne log plus les erreurs SQL
  });

export default app;
