import { AppDataSource } from '../dataSource'
import { UserHistory } from '../userHistory/userHistoryEntity'
import { MoreThan } from 'typeorm'

export async function generateBadges(
  userId: number,
): Promise<string[]> {
  const historyRepo =
    AppDataSource.getRepository(UserHistory)

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const history = await historyRepo.find({
    where: {
      user: { id: userId },
      playedAt: MoreThan(sixMonthsAgo),
    },
    relations: ['user'],
  })

  const badges: string[] = []

  // ============================
  // 🎵 Badges Classiques
  // ============================

  // 1. Premier pas
  if (history.length > 0) {
    badges.push('🎵 Premier pas')
  }

  // 2. 100 écoutes
  if (history.length >= 100) {
    badges.push('💯 100 écoutes')
  }

  // 3. Noctambule
  const nightPlays = history.filter(
    (h) =>
      new Date(h.playedAt).getHours() >= 0 &&
      new Date(h.playedAt).getHours() < 6,
  )
  if (nightPlays.length >= 30) {
    badges.push('🌙 Noctambule')
  }

  // 4. Fan d’un artiste
  const artistCount: Record<string, number> = {}
  for (const h of history) {
    if (!artistCount[h.artistName])
      artistCount[h.artistName] = 0
    artistCount[h.artistName]++
  }
  const topArtist = Object.entries(artistCount).sort(
    (a, b) => b[1] - a[1],
  )[0]
  if (topArtist && topArtist[1] >= 50) {
    badges.push(`⭐ Fan de ${topArtist[0]}`)
  }

  // 5. Marathon (écoutes 7 jours d’affilée)
  const daysSet = new Set(
    history.map((h) => new Date(h.playedAt).toDateString()),
  )
  if (daysSet.size >= 7) {
    badges.push('🔥 Marathon 7 jours')
  }

  // ============================
  // 🦸 Badges Marvel
  // ============================

  // Iron Man → +300 écoutes
  if (history.length >= 300) {
    badges.push('🤖 Iron Man (300 écoutes)')
  }

  // Hulk → +50 écoutes de musiques énergiques (simulateur: artiste 'Metallica')
  if (
    artistCount['Metallica'] &&
    artistCount['Metallica'] >= 50
  ) {
    badges.push('💪 Hulk (Fan de Metal)')
  }

  // Thor → +20 écoutes un vendredi soir
  const fridayPlays = history.filter(
    (h) =>
      new Date(h.playedAt).getDay() === 5 &&
      new Date(h.playedAt).getHours() >= 18,
  )
  if (fridayPlays.length >= 20) {
    badges.push('🔨 Thor (Vendredi soir électrique)')
  }

  // Black Widow → variétés d’artistes (> 50 artistes différents)
  const uniqueArtists = new Set(
    history.map((h) => h.artistName),
  )
  if (uniqueArtists.size >= 50) {
    badges.push('🕷️ Spiderman (explorateur)')
  }

  // Captain America → écoute le matin (5h-9h)
  const morningPlays = history.filter(
    (h) =>
      new Date(h.playedAt).getHours() >= 5 &&
      new Date(h.playedAt).getHours() < 9,
  )
  if (morningPlays.length >= 30) {
    badges.push('🛡️ Captain America (matinal)')
  }

  return badges
}
