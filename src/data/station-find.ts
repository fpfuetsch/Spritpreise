import axios from 'axios'
import { BASE_URL } from './model'

const API_KEY = process.env.API_KEY
const SEARCH_RADIUS = process.env.SEARCH_RADIUS || 10
const GEOCODING_BASE_URL = 'https://nominatim.openstreetmap.org/search'

export async function findStationsByLocation(location) {
  const urlLocation = `${BASE_URL}list.php?lat=${location.latitude}&lng=${location.longitude}&rad=${SEARCH_RADIUS}&sort=dist&type=all&apikey=${API_KEY}`
  const data: any = await axios(urlLocation).then(result => result.data).catch(err => console.error(err))
  return (data !== undefined && data.ok) ? data.stations : []
}

export async function findStationsByText(text) {
  const urlLocation = `${GEOCODING_BASE_URL}?q=${encodeURIComponent(text)}&format=json&countrycodes=de`
  const data = await axios.get(urlLocation, {
    headers: {
      'User-Agent': 'spritpreis-bot/1.0'
    }
  }).then(result => result.data).catch(err => {
    console.error('Nominatim request failed', err?.response?.status || err)
    return []
  })
  const res = Array.isArray(data) ? data[0] : undefined
  return {
    location: res ? res.display_name : 'error',
    stations: res ? await findStationsByLocation({latitude: res.lat, longitude: res.lon}) : []
  }
}
