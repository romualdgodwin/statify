import { ChildEntity, Column } from 'typeorm'
import { User } from './userEntity'

@ChildEntity()
export class Client extends User {
  @Column()
  address: string
}
