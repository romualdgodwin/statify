import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm'

@Entity()
export class ErrorLog {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  message!: string

  @Column('text')
  stack!: string

  @CreateDateColumn()
  createdAt!: Date
}
