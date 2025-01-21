import { ChildEntity, Column } from 'typeorm'
import { User } from './userEntity'

@ChildEntity()
export class Company extends User {
  @Column()
  companyName: string
}
