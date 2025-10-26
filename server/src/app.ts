import 'reflect-metadata'
import express from 'express'
import cors from 'cors'

import { AppDataSource } from './dataSource'
import spotifyController from './modules/spotify/spotifyController'
import authController from './modules/auth/authController'
import userRouter from './modules/user/userRoute'
import adminController from './modules/admin/adminController'
import { ErrorLog } from './modules/logs/errorLogEntity'

const app = express()

// Middlewares
app.use(cors())
app.use(express.json())

// Routes
app.use('/spotify', spotifyController)
app.use('/auth', authController)
app.use('/users', userRouter)
app.use('/admin', adminController)

// Middleware global d’erreurs
// Middleware global d’erreurs
app.use(async (err: any, _req: any, res: any) => {
  try {
    const repo = AppDataSource.getRepository(ErrorLog)
    await repo.save({
      message: err.message ?? 'Unknown error',
      stack: err.stack ?? '',
    })
  } catch {
    // On ignore l'erreur de log pour éviter une boucle
  }

  res.status(500).json({
    error: 'Erreur interne serveur',
  })
})
export default app
