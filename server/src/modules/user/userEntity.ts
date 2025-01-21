import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  TableInheritance,
} from 'typeorm'
import { Animal } from '../animal/animalEntity'

@Entity()
@TableInheritance({
  column: { type: 'varchar', name: 'type' },
})
export class User {
  @PrimaryGeneratedColumn()
  id: number
  @Column({
    unique: true,
  })
  login: string
  @Column()
  password: string
  @Column({
    nullable: true,
  })
  role?: string
  @OneToOne(() => Animal, { nullable: true })
  @JoinColumn()
  animal?: Animal
}
