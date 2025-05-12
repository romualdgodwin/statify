import { AppDataSource } from './dataSource'
import { Client } from './modules/user/clientEntity'
import { clientRepository } from './modules/user/clientRepository'
import { Company } from './modules/user/companyEntity'
import { companyRepository } from './modules/user/companyRepository'
import { userRepository } from './modules/user/userRepository'

const test = async () => {
  await AppDataSource.initialize()
  const client = new Client()
  client.address = 'Montreuil'
  client.login = 'plop'
  client.password = 'plop'

  clientRepository.save(client)

  const company = new Company()
  company.companyName = 'plop'
  company.login = 'plop2'
  company.password = 'plop'

  companyRepository.save(company)

  console.log('users', await userRepository.find())
  console.log('companies', await companyRepository.find())
  console.log('client', await clientRepository.find())
}

test()
