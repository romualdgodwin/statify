import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'
import { UserHistory } from '../../userHistory/userHistoryEntity'

@Entity('users') 
export class User {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  email!: string

  @Column({ nullable: true })
  displayName?: string

  @Column({ default: 'user' })
  role!: string 

  @Column({ nullable: true })
  spotifyId?: string

  @Column({ nullable: true })
  spotifyAccessToken?: string

  @Column({ nullable: true })
  spotifyRefreshToken?: string

  @Column({ type: 'timestamptz', nullable: true })
  tokenExpiresAt?: Date

  @Column({ type: 'timestamptz', nullable: true })
  spotifyTokenExpiry?: Date

  @Column({ type: 'timestamptz', nullable: true })
  lastLogin?: Date


  @Column({ nullable: true })
  password?: string


  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date


  @OneToMany(() => UserHistory, (history) => history.user, {
    cascade: true,
  })
  histories!: UserHistory[]
}
