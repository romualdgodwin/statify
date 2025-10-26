import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm'
import { User } from '../modules/user/userEntity'

@Entity('user_histories')
export class UserHistory {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ nullable: true })
  trackId!: string // ✅ Spotify track ID (utile si tu veux relier aux APIs plus tard)

  @Column()
  trackName!: string

  @Column()
  artistName!: string

  @Column({ type: 'timestamptz', nullable: true })
  playedAt!: Date

  @ManyToOne(() => User, (user) => user.histories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' }) // ✅ colonne FK explicite
  user!: User

  @CreateDateColumn()
  createdAt!: Date
}
