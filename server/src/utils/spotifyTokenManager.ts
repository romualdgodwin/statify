import axios from 'axios'
import querystring from 'querystring'
import { AppDataSource } from '../dataSource'
import { User } from '../modules/user/userEntity' // ✅
import { config } from '../../config'

const CLIENT_ID = config.spotify.clientId
const CLIENT_SECRET = config.spotify.clientSecret
console.log(
  '🔑 Using Spotify credentials:',
  CLIENT_ID,
  CLIENT_SECRET?.slice(0, 5) + '...',
)

/**
 * Retourne un access_token valide pour un utilisateur.
 * Rafraîchit le token si nécessaire et sauvegarde en DB.
 */
export async function getValidAccessToken(
  user: User,
): Promise<string> {
  // ✅ Vérifie si le token est encore valide
  if (
    user.spotifyAccessToken &&
    user.tokenExpiresAt &&
    user.tokenExpiresAt.getTime() > Date.now()
  ) {
    return user.spotifyAccessToken
  }

  if (!user.spotifyRefreshToken) {
    throw new Error(
      '❌ Aucun refresh_token pour cet utilisateur.',
    )
  }

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token: user.spotifyRefreshToken,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
      {
        headers: {
          'Content-Type':
            'application/x-www-form-urlencoded',
        },
      },
    )

    const newAccessToken = response.data.access_token
    const expiresIn = response.data.expires_in

    user.spotifyAccessToken = newAccessToken
    user.tokenExpiresAt = new Date(
      Date.now() + expiresIn * 1000,
    )

    // ✅ sauvegarde en base dans la table users
    await AppDataSource.getRepository(User).save(user)

    console.log('✅ Nouveau Spotify access_token obtenu !')
    return newAccessToken
  } catch (error: any) {
    console.error(
      '❌ Erreur refresh token:',
      error.response?.data || error.message,
    )
    throw error
  }
}
