// server/src/index.ts
import 'reflect-metadata'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { AppDataSource } from './dataSource'

import userRouter from './modules/user/userRoute'
import authController from './modules/auth/authController'
import spotifyController from './modules/spotify/spotifyController'

import { initSpotifyTokens } from './utils/spotifyTokenManager'
import { User } from './modules/user/userEntity'

// ✅ Charger les variables d'environnement dès le début
dotenv.config()

const app = express()

// Middlewares
app.use(cors())
app.use(express.json())

// Routes
app.get('/', (req, res) => {
  res.send('Plop!')
})

app.use('/users', userRouter)
app.use('/auth', authController)
app.use('/spotify', spotifyController)

// Lancement du serveur après initialisation de la DB
const port: number = process.env.PORT
  ? Number(process.env.PORT)
  : 3000

AppDataSource.initialize()
  .then(async () => {
    console.log('✅ Database connected')

    // 🔹 Charger le refresh token d’un user existant au démarrage (ex: ton compte)
    const userRepo = AppDataSource.getRepository(User)
    const user = await userRepo.findOne({
      where: { email: 'romualag@gmail.com' },
    })

    if (user?.spotifyRefreshToken) {
      await initSpotifyTokens(user.spotifyRefreshToken)
      console.log(
        '🎵 Tokens Spotify initialisés au démarrage',
      )
    } else {
      console.log(
        "⚠️ Aucun refresh token Spotify trouvé en DB pour l'utilisateur",
      )
    }

    app.listen(port, () => {
      console.log(
        `✅ Server started at http://localhost:${port}`,
      )
      console.log(
        '🎵 SPOTIFY_REDIRECT_URI:',
        process.env.SPOTIFY_REDIRECT_URI,
      )
    })
  })
  .catch((error) => {
    console.error(
      '❌ Error during Data Source initialization',
      error,
    )
  })
