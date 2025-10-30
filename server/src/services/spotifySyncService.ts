  // server/src/services/spotifySync.ts
  import axios from 'axios'
  import { AppDataSource } from '../dataSource'
  import { User } from '../modules/user/userEntity'
  import { UserHistory } from '../userHistory/userHistoryEntity'

  /**
   * 🔄 Synchronise l’historique Spotify de TOUS les utilisateurs
   * → ajoute uniquement les nouveaux titres dans la DB
   */
  export async function syncSpotifyHistory() {
    const userRepo = AppDataSource.getRepository(User)
    const historyRepo = AppDataSource.getRepository(UserHistory)

    const users = await userRepo.find()

    for (const user of users) {
      if (!user.spotifyAccessToken) continue

      try {
        // 🔹 1) Récupère les titres récemment joués
        const response = await axios.get(
          'https://api.spotify.com/v1/me/player/recently-played?limit=50',
          {
            headers: { Authorization: `Bearer ${user.spotifyAccessToken}` },
          }
        )

        const items = response.data.items
        let inserted = 0

        // 🔹 2) Récupère l’appareil actif au moment du sync
        let deviceType: string | null = null
        let deviceName: string | null = null
        try {
          const playerRes = await axios.get(
            'https://api.spotify.com/v1/me/player',
            {
              headers: { Authorization: `Bearer ${user.spotifyAccessToken}` },
            }
          )
          if (playerRes.data?.device) {
            deviceType = playerRes.data.device.type
            deviceName = playerRes.data.device.name
          }
        } catch {
          console.warn(`⚠️ Impossible de récupérer le device pour ${user.email}`)
        }

        // 🔹 3) Stocke chaque titre avec l’appareil trouvé
        for (const item of items) {
          const trackName = item.track.name
          const artistName = item.track.artists.map((a: any) => a.name).join(', ')
          const playedAt = new Date(item.played_at)
          const durationMs = item.track.duration_ms ?? null

          const exists = await historyRepo.findOne({
            where: { user: { id: user.id }, trackName, artistName, playedAt },
          })

          if (!exists) {
            const history = new UserHistory()
            history.trackName = trackName
            history.artistName = artistName
            history.playedAt = playedAt
            history.user = user
            history.durationMs = durationMs
            history.deviceType = deviceType
            history.deviceName = deviceName

            await historyRepo.save(history)
            inserted++
          }
        }

        console.log(`🎵 Sync ${user.email}: ${inserted} nouveaux titres`)
      } catch (err: any) {
        console.error(
          `❌ Erreur sync ${user.email}:`,
          err.response?.data || err.message
        )
      }
    }
  }

  /**
   * 🔄 Rafraîchit l’historique d’UN utilisateur
   */
  export async function refreshSpotifyData(user: User) {
    const historyRepo = AppDataSource.getRepository(UserHistory)

    if (!user.spotifyAccessToken) {
      throw new Error('User has no Spotify token')
    }

    const response = await axios.get(
      'https://api.spotify.com/v1/me/player/recently-played?limit=50',
      {
        headers: { Authorization: `Bearer ${user.spotifyAccessToken}` },
      }
    )

    const items = response.data.items ?? []
    let inserted = 0

    // 🔹 Récupère aussi l’appareil actif
    let deviceType: string | null = null
    let deviceName: string | null = null
    try {
      const playerRes = await axios.get(
        'https://api.spotify.com/v1/me/player',
        {
          headers: { Authorization: `Bearer ${user.spotifyAccessToken}` },
        }
      )
      if (playerRes.data?.device) {
        deviceType = playerRes.data.device.type
        deviceName = playerRes.data.device.name
      }
    } catch {
      console.warn(`⚠️ Impossible de récupérer le device pour ${user.email}`)
    }

    for (const item of items) {
      const trackName = item.track.name
      const artistName = item.track.artists.map((a: any) => a.name).join(', ')
      const playedAt = new Date(item.played_at)
      const durationMs = item.track.duration_ms ?? null

      const exists = await historyRepo.findOne({
        where: { user: { id: user.id }, trackName, artistName, playedAt },
      })

      if (!exists) {
        const history = new UserHistory()
        history.trackName = trackName
        history.artistName = artistName
        history.playedAt = playedAt
        history.user = user
        history.durationMs = durationMs
        history.deviceType = deviceType
        history.deviceName = deviceName

        await historyRepo.save(history)
        inserted++
      }
    }

    return inserted
  }
