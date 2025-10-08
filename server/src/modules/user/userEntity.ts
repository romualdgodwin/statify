// server/src/modules/user/userEntity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("users") // ✅ éviter le mot réservé "user"
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  // 🔹 Email ou login unique
  @Column({ unique: true })
  email!: string;

  // 🔹 Nullable car un utilisateur Spotify peut ne pas avoir de mot de passe
  @Column({ nullable: true })
  password?: string;

  @Column({ default: "user" })
  role!: string;

  // ==========================================================
  // 🔹 Champs pour gestion Spotify OAuth
  // ==========================================================
  @Column({ nullable: true, unique: true })
  spotifyId?: string;

  @Column({ nullable: true })
  displayName?: string;

  @Column({ nullable: true, type: "text" })
  spotifyAccessToken?: string;

  @Column({ nullable: true, type: "text" })
  spotifyRefreshToken?: string;

  @Column({ nullable: true, type: "timestamptz" })
  tokenExpiresAt?: Date;

  // ==========================================================
  // 🔹 Tracking création / mise à jour
  // ==========================================================
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
