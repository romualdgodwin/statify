import { AppDataSource } from "../dataSource"
import { User } from "../modules/user/userEntity"
import bcrypt from "bcryptjs"

export async function seedDatabase() {
  const userRepo = AppDataSource.getRepository(User)

  // Admin
  const adminEmail = "admin@statify.com"
  const adminExists = await userRepo.findOne({ where: { email: adminEmail } })

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash("admin123", 10)
    const adminUser = userRepo.create({
      email: adminEmail,
      displayName: "Admin",
      role: "admin",
      password: hashedPassword,
    })
    await userRepo.save(adminUser)
    console.log("✅ Compte admin créé")
  }

  // User
  const userEmail = "user@statify.com"
  const userExists = await userRepo.findOne({ where: { email: userEmail } })

  if (!userExists) {
    const hashedPassword = await bcrypt.hash("user123", 10)
    const normalUser = userRepo.create({
      email: userEmail,
      displayName: "User",
      role: "user",
      password: hashedPassword,
    })
    await userRepo.save(normalUser)
    console.log("✅ Compte user créé")
  }
}
