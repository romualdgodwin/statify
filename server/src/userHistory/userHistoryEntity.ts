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

  @Column({ type: 'varchar', length: 50, nullable: true })
  trackId!: string | null  // ✅ Spotify track ID

  @Column({ type: 'varchar' })
  trackName!: string

  @Column({ type: 'varchar' })
  artistName!: string

  @Column({ type: 'int', nullable: true })
  durationMs!: number | null  // durée en ms

  @Column({ type: 'varchar', nullable: true })
  deviceType!: string | null  // type d’appareil

  @Column({ type: 'varchar', nullable: true })
  deviceName!: string | null  // nom de l’appareil

  @Column({ type: 'timestamptz', nullable: true })
  playedAt!: Date | null

  @ManyToOne(() => User, (user) => user.histories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User

  @CreateDateColumn()
  createdAt!: Date
}
