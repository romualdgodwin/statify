import { AppDataSource } from '../../dataSource'
import { Company } from './companyEntity'

export const companyRepository =
  AppDataSource.getRepository(Company)
