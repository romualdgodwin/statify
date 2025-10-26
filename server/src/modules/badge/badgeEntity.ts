import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm'

@Entity('badges')
export class Badge {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  label!: string

  @Column()
  description!: string

  @Column()
  icon!: string

  @Column({ default: false })
  isCustom!: boolean
}

