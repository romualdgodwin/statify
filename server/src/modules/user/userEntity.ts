// server/src/modules/user/userEntity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'
import { UserHistory } from '../../userHistory/userHistoryEntity'

@Entity('users') // ✅ Forcer le bon nom de table
export class User {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  email!: string

  @Column({ nullable: true })
  displayName?: string

  @Column({ default: 'user' })
  role!: string // "user" | "admin"

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

  // ✅ Mot de passe
  @Column({ nullable: true })
  password?: string

  // ✅ Auto timestamps
  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  // ✅ Relation avec l’historique
  @OneToMany(() => UserHistory, (history) => history.user, {
    cascade: true,
  })
  histories!: UserHistory[]
}
