import axios from 'axios';
import { AppDataSource } from '../dataSource';
import { User } from '../modules/user/userEntity';
import { UserHistory } from '../userHistory/userHistoryEntity';

/**
 * Synchronise l'historique Spotify pour tous les utilisateurs disposant d'un token valide.
 */
export async function syncSpotifyHistory() {
  const userRepo = AppDataSource.getRepository(User);
  const historyRepo = AppDataSource.getRepository(UserHistory);

  const users = await userRepo.find();

  for (const user of users) {
    if (!user.spotifyAccessToken) continue;

    try {
      // 1. Récupère les titres récemment joués
      const response = await axios.get(
        'https://api.spotify.com/v1/me/player/recently-played?limit=50',
        { headers: { Authorization: `Bearer ${user.spotifyAccessToken}` } }
      );

      const items: any[] = response.data.items ?? [];
      let inserted = 0;

      // 2. Récupère l’appareil actif
      let deviceType: string | null = null;
      let deviceName: string | null = null;

      try {
        const playerRes = await axios.get(
          'https://api.spotify.com/v1/me/player',
          { headers: { Authorization: `Bearer ${user.spotifyAccessToken}` } }
        );

        if (playerRes.data?.device) {
          deviceType = playerRes.data.device.type ?? null;
          deviceName = playerRes.data.device.name ?? null;
        }
      } catch {
        console.warn(`⚠️ Impossible de récupérer le device pour ${user.email}`);
      }

      // 3. Stocke chaque titre
      for (const item of items) {
        const trackName = item.track.name;
        const artistName = item.track.artists.map((a: any) => a.name).join(', ');
        const playedAt = new Date(item.played_at);
        const durationMs = item.track.duration_ms ?? null;

        const exists = await historyRepo.findOne({
          where: { user: { id: user.id }, trackName, artistName, playedAt },
        });

        if (!exists) {
          const history = historyRepo.create({
            trackName,
            artistName,
            playedAt,
            user,
            durationMs,
            deviceType,
            deviceName,
          });
          await historyRepo.save(history);
          inserted++;
        }
      }

      console.log(`🎵 Sync ${user.email}: ${inserted} nouveaux titres`);
    } catch (err: any) {
      console.error(`❌ Erreur sync ${user.email}:`, err.response?.data || err.message);
    }
  }
}

/**
 * Rafraîchit l’historique Spotify d’un utilisateur spécifique.
 */
export async function refreshSpotifyData(user: User) {
  const historyRepo = AppDataSource.getRepository(UserHistory);

  if (!user.spotifyAccessToken) {
    throw new Error('User has no Spotify token');
  }

  const response = await axios.get(
    'https://api.spotify.com/v1/me/player/recently-played?limit=50',
    { headers: { Authorization: `Bearer ${user.spotifyAccessToken}` } }
  );

  const items: any[] = response.data.items ?? [];
  let inserted = 0;

  let deviceType: string | null = null;
  let deviceName: string | null = null;

  try {
    const playerRes = await axios.get(
      'https://api.spotify.com/v1/me/player',
      { headers: { Authorization: `Bearer ${user.spotifyAccessToken}` } }
    );

    if (playerRes.data?.device) {
      deviceType = playerRes.data.device.type ?? null;
      deviceName = playerRes.data.device.name ?? null;
    }
  } catch {
    console.warn(`⚠️ Impossible de récupérer le device pour ${user.email}`);
  }

  for (const item of items) {
    const trackName = item.track.name;
    const artistName = item.track.artists.map((a: any) => a.name).join(', ');
    const playedAt = new Date(item.played_at);
    const durationMs = item.track.duration_ms ?? null;

    const exists = await historyRepo.findOne({
      where: { user: { id: user.id }, trackName, artistName, playedAt },
    });

    if (!exists) {
      const history = historyRepo.create({
        trackName,
        artistName,
        playedAt,
        user,
        durationMs,
        deviceType,
        deviceName,
      });
      await historyRepo.save(history);
      inserted++;
    }
  }

  return inserted;
}
