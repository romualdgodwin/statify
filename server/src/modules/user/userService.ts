import { AppDataSource } from '../../dataSource'
import { User } from './userEntity'

export class UserService {
  private userRepository = AppDataSource.getRepository(User)

  // ======================================================
  // 📌 Récupérer tous les utilisateurs
  // ======================================================
  async findAll(): Promise<User[]> {
    return this.userRepository.find()
  }

  // ======================================================
  // 📌 Récupérer un utilisateur par ID
  // ======================================================
  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } })
  }

  // ======================================================
  // 📌 Récupérer un utilisateur par email
  // (utile pour login ou vérif existence)
  // ======================================================
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } })
  }

  // ======================================================
  // 📌 Créer un utilisateur
  // ======================================================
  async create(userData: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(userData)
    return this.userRepository.save(newUser)
  }

  // ======================================================
  // 📌 Mettre à jour un utilisateur
  // ======================================================
  async update(
    id: number,
    userData: Partial<User>,
  ): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id },
    })
    if (!user) return null

    Object.assign(user, userData)
    return this.userRepository.save(user)
  }

  // ======================================================
  // 📌 Supprimer un utilisateur
  // ======================================================
  async delete(id: number): Promise<boolean> {
    const result = await this.userRepository.delete(id)
    return result.affected !== 0
  }
}
