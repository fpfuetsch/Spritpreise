
import fetch from 'node-fetch'
import { BASE_URL } from './model'

const API_KEY = process.env.API_KEY
const SEARCH_RADIUS = process.env.SEARCH_RADIUS || 10

export async function findStationsByLocation(location) {
  const urlLocation = `${BASE_URL}list.php?lat=${location.latitude}&lng=${location.longitude}&rad=${SEARCH_RADIUS}&sort=dist&type=all&apikey=${API_KEY}`
  const data = await fetch(urlLocation).then(result => result.json()).catch(err => console.error(err))
  return (data !== undefined && data.ok) ? data.stations : []
}
