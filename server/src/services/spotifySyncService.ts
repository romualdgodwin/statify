import axios from 'axios'
import { AppDataSource } from '../dataSource'
import { User } from '../modules/user/userEntity'
import { UserHistory } from '../userHistory/userHistoryEntity'

// 🔄 Sync de tous les utilisateurs
export async function syncSpotifyHistory() {
  const userRepo = AppDataSource.getRepository(User)
  const historyRepo =
    AppDataSource.getRepository(UserHistory)

  const users = await userRepo.find()

  for (const user of users) {
    if (!user.spotifyAccessToken) continue

    try {
      const response = await axios.get(
        'https://api.spotify.com/v1/me/player/recently-played?limit=20',
        {
          headers: {
            Authorization: `Bearer ${user.spotifyAccessToken}`,
          },
        },
      )

      const items = response.data.items
      let inserted = 0

      for (const item of items) {
        const trackName = item.track.name
        const artistName = item.track.artists
          .map((a: any) => a.name)
          .join(', ')
        const playedAt = new Date(item.played_at)

        const exists = await historyRepo.findOne({
          where: { user: { id: user.id }, playedAt },
        })

        if (!exists) {
          const history = historyRepo.create({
            trackName,
            artistName,
            playedAt,
            user,
          })
          await historyRepo.save(history)
          inserted++
        }
      }

      console.log(
        `🎵 Sync ${user.email}: ${inserted} nouveaux titres`,
      )
    } catch (err: any) {
      console.error(
        `❌ Erreur sync ${user.email}:`,
        err.response?.data || err.message,
      )
    }
  }
}

// 🔄 Rafraîchir uniquement un utilisateur
export async function refreshSpotifyData(user: User) {
  const historyRepo =
    AppDataSource.getRepository(UserHistory)

  if (!user.spotifyAccessToken) {
    throw new Error('User has no Spotify token')
  }

  const response = await axios.get(
    'https://api.spotify.com/v1/me/player/recently-played?limit=20',
    {
      headers: {
        Authorization: `Bearer ${user.spotifyAccessToken}`,
      },
    },
  )

  const items = response.data.items ?? []
  let inserted = 0

  for (const item of items) {
    const trackName = item.track.name
    const artistName = item.track.artists
      .map((a: any) => a.name)
      .join(', ')
    const playedAt = new Date(item.played_at)

    const exists = await historyRepo.findOne({
      where: { user: { id: user.id }, playedAt },
      relations: ['user'],
    })

    if (!exists) {
      const history = historyRepo.create({
        trackName,
        artistName,
        playedAt,
        user,
      })
      await historyRepo.save(history)
      inserted++
    }
  }

  return inserted
}
