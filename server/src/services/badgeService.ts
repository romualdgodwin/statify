// server/src/services/badgeService.ts
import { AppDataSource } from '../dataSource'
import { UserHistory } from '../userHistory/userHistoryEntity'
import { Badge } from '../modules/badge/badgeEntity'

/**
 * ⚙️ Badges système — ceux qui sont toujours disponibles
 */
export const SYSTEM_BADGES = [
  { label: '🎵 Premier pas', description: 'Ton premier morceau écouté ! Bienvenue 🎉', icon: '🎵' },
  { label: '💯 100 écoutes', description: 'Tu as franchi la barre mythique des 100 écoutes.', icon: '💯' },
  { label: '🌙 Noctambule', description: 'Écoutes entre 0h et 6h — hibou confirmé 🦉', icon: '🌙' },
  { label: '⭐ Fan de', description: 'Tu as écouté ton artiste préféré au moins 50 fois !', icon: '⭐' },
  { label: '🔥 Marathon 7 jours', description: 'Écoutes chaque jour pendant une semaine complète 🔥', icon: '🔥' },
  { label: '🤖 Iron Man (300 écoutes)', description: '300 écoutes, ton armure musicale est forgée.', icon: '🤖' },
  { label: '💪 Hulk (Fan de Metal)', description: 'Tu aimes le metal façon Hulk !', icon: '💪' },
  { label: '🔨 Thor (Vendredi soir électrique)', description: 'Vendredi soir après 18h, digne d’Asgard ⚡', icon: '🔨' },
  { label: '🕷️ Spiderman (explorateur)', description: 'Tu explores +50 artistes différents 🕸️', icon: '🕷️' },
  { label: '🛡️ Captain America (matinal)', description: 'Tu te lèves tôt pour écouter ta musique 🇺🇸', icon: '🛡️' },
]

/**
 * 🧠 Génération des badges utilisateur (inchangé)
 */
export async function generateBadges(userId: number): Promise<string[]> {
  const historyRepo = AppDataSource.getRepository(UserHistory)
  const history = await historyRepo.find({
    where: { user: { id: userId } },
    relations: ['user'],
  })

  const badges: string[] = []

  // 🎵 Premier pas
  if (history.length > 0) badges.push('🎵 Premier pas')

  // 💯 100 écoutes
  if (history.length >= 100) badges.push('💯 100 écoutes')

  // 🌙 Noctambule
  const nightPlays = history.filter(
    (h) =>
      h.playedAt &&
      new Date(h.playedAt).getHours() >= 0 &&
      new Date(h.playedAt).getHours() < 6,
  )
  if (nightPlays.length >= 30) badges.push('🌙 Noctambule')

  // ⭐ Fan d’un artiste
  const artistCount: Record<string, number> = {}
  for (const h of history) {
    if (!artistCount[h.artistName]) artistCount[h.artistName] = 0
    artistCount[h.artistName]++
  }
  const topArtist = Object.entries(artistCount).sort((a, b) => b[1] - a[1])[0]
  if (topArtist && topArtist[1] >= 50) badges.push(`⭐ Fan de ${topArtist[0]}`)

  // 🔥 Marathon (7 jours consécutifs)
  const daysSet = new Set(
    history
      .filter((h) => h.playedAt)
      .map((h) => new Date(h.playedAt!).toDateString()),
  )
  if (daysSet.size >= 7) badges.push('🔥 Marathon 7 jours')

  // 🤖 Iron Man (300 écoutes)
  if (history.length >= 300) badges.push('🤖 Iron Man (300 écoutes)')

  // 💪 Hulk (Fan de Metal)
  if (artistCount['Metallica'] && artistCount['Metallica'] >= 50)
    badges.push('💪 Hulk (Fan de Metal)')

  // 🔨 Thor (Vendredi soir électrique)
  const fridayPlays = history.filter(
    (h) =>
      h.playedAt &&
      new Date(h.playedAt).getDay() === 5 &&
      new Date(h.playedAt).getHours() >= 18,
  )
  if (fridayPlays.length >= 20)
    badges.push('🔨 Thor (Vendredi soir électrique)')

  // 🕷️ Spiderman (explorateur)
  const uniqueArtists = new Set(history.map((h) => h.artistName))
  if (uniqueArtists.size >= 50) badges.push('🕷️ Spiderman (explorateur)')

  // 🛡️ Captain America (matinal)
  const morningPlays = history.filter(
    (h) =>
      h.playedAt &&
      new Date(h.playedAt).getHours() >= 5 &&
      new Date(h.playedAt).getHours() < 9,
  )
  if (morningPlays.length >= 30)
    badges.push('🛡️ Captain America (matinal)')

  return badges
}

/**
 * ⚙️ Retourne tous les badges existants :
 * - Badges système (définis ici)
 * - Badges admin (issus de la DB)
 */
export async function getAllBadgeDefinitions() {
  const repo = AppDataSource.getRepository(Badge)
  const dbBadges = await repo.find()

  // On fusionne les deux sources
  const systemAsEntities = SYSTEM_BADGES.map((b, i) => ({
    id: -(i + 1), // id virtuel négatif pour éviter collisions
    ...b,
    isCustom: false,
  }))

  return [...systemAsEntities, ...dbBadges]
}
