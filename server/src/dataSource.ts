import { DataSource } from 'typeorm'
import { User } from './modules/user/userEntity'
import { UserHistory } from './userHistory/userHistoryEntity'
import { Badge } from './modules/badge/badgeEntity'

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'azerty',
  database: process.env.DB_NAME || 'statify',
  synchronize: true, // crée automatiquement les tables (à désactiver en prod)
  logging: true, // affiche les requêtes SQL dans la console
  entities: [User, UserHistory, Badge],
})

// Initialize connection immediately (only once, ex: in app.ts / main.ts)
AppDataSource.initialize()
  .then(() => {
    console.log('📦 Database connected successfully')
  })
  .catch((error) => {
    console.error(
      '❌ Error during Data Source initialization',
      error,
    )
  })
