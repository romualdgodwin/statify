import 'reflect-metadata'
import { AppDataSource } from '../dataSource'
import { User } from '../modules/user/userEntity'
import { UserHistory } from '../userHistory/userHistoryEntity'

async function seedBadges() {
  await AppDataSource.initialize()
  console.log('✅ DB connectée')

  const userRepo = AppDataSource.getRepository(User)
  const historyRepo =
    AppDataSource.getRepository(UserHistory)

  const user = await userRepo.findOne({
    where: { email: 'romualag@gmail.com' },
  })
  if (!user) {
    console.error('❌ Utilisateur introuvable')
    return
  }

  const now = new Date()

  //  Premier pas → déjà validé


  // Fan d’un artiste (Booba 120 écoutes)
  for (let i = 0; i < 120; i++) {
    const playedAt = new Date(now.getTime() - i * 60000) // chaque minute
    const history = historyRepo.create({
      trackName: `Track Booba ${i}`,
      artistName: 'Booba',
      playedAt,
      user,
    })
    await historyRepo.save(history)
  }

  //  Hulk (60 écoutes de Metallica)
  for (let i = 0; i < 60; i++) {
    const playedAt = new Date(now.getTime() - i * 3600000) // chaque heure
    const history = historyRepo.create({
      trackName: `Metallica Song ${i}`,
      artistName: 'Metallica',
      playedAt,
      user,
    })
    await historyRepo.save(history)
  }

  //  Thor (25 écoutes vendredi soir après 18h)
  const friday = new Date()
  friday.setDate(friday.getDate() - friday.getDay() + 5) // dernier vendredi
  friday.setHours(19, 0, 0, 0)

  for (let i = 0; i < 25; i++) {
    const playedAt = new Date(friday.getTime() + i * 60000)
    const history = historyRepo.create({
      trackName: `Friday Song ${i}`,
      artistName: 'Party Artist',
      playedAt,
      user,
    })
    await historyRepo.save(history)
  }

  // Captain America (35 écoutes entre 5h et 9h)
  const morning = new Date()
  morning.setHours(6, 0, 0, 0)
  for (let i = 0; i < 35; i++) {
    const playedAt = new Date(
      morning.getTime() + i * 120000,
    ) // toutes les 2 minutes
    const history = historyRepo.create({
      trackName: `Morning Track ${i}`,
      artistName: 'Early Bird',
      playedAt,
      user,
    })
    await historyRepo.save(history)
  }

  // Marathon 7 jours → 1 écoute par jour sur 7 jours consécutifs
  for (let d = 0; d < 7; d++) {
    const day = new Date()
    day.setDate(now.getDate() - d)
    day.setHours(12, 0, 0, 0)
    const history = historyRepo.create({
      trackName: `Daily Track ${d}`,
      artistName: 'Routine',
      playedAt: day,
      user,
    })
    await historyRepo.save(history)
  }

  console.log('✅ Badges seedés avec succès !')
  process.exit(0)
}

seedBadges().catch((err) => {
  console.error('❌ Erreur seed:', err)
  process.exit(1)
})
