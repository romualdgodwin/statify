import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity()
export class Animal {
  @PrimaryGeneratedColumn()
  id: number
  @Column()
  species: string
  @Column()
  name: string
}
