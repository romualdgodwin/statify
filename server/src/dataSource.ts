import { DataSource } from 'typeorm'
import { User } from './modules/user/userEntity'
import { Animal } from './modules/animal/animalEntity'
import { Company } from './modules/user/companyEntity'
import { Client } from './modules/user/clientEntity'

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'azerty',
  database: 'postgres',
  entities: [User, Animal, Company, Client],
  synchronize: true,
  logging: false,
})
