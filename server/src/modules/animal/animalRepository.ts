import { AppDataSource } from '../../dataSource'
import { Animal } from './animalEntity'

export const animalRepository =
  AppDataSource.getRepository(Animal)
