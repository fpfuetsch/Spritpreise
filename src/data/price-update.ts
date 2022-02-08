
import * as cron from 'node-cron'
import axios from 'axios'
import { notifyAboutAlerts } from '../telegram/notifications/price-update-notification'
import { Alert, AlertLevel, BASE_URL, GasStation, GAS_TYPES, PriceSnapshot, PriceStats } from './model'

const UPDATE_CYCLE = process.env.UPDATE_CYCLE || 15
const API_KEY = process.env.API_KEY
const MILLIS_DAY = 24 * 60 * 60 * 1000
const MAX_GAS_STATIONS_PER_REQUEST = 10

export async function fetchPrices(): Promise<Alert[]> {
  let alerts: Alert[] = []
  const gasStations = await GasStation.find().exec()
  const gasStationIds = gasStations.map(station => station.stationId)
  const requestPackages = []

  for (let i = 0; i < Math.ceil(gasStationIds.length / MAX_GAS_STATIONS_PER_REQUEST); i++) {
    requestPackages.push(gasStationIds.slice(i* MAX_GAS_STATIONS_PER_REQUEST, (i+1)* MAX_GAS_STATIONS_PER_REQUEST))
  }

  for(const requestPackage of requestPackages) {

    const urlPrices = `${BASE_URL}prices.php?ids=${requestPackage.join(',')}&apikey=${API_KEY}`
    const data : any = await axios(urlPrices).then(result => result.data).catch(error => console.error(error))

    if (data !== undefined && data.ok) {
      const prices = data.prices
      for (const station of gasStations) {
        if (prices[station.stationId] !== undefined && prices[station.stationId].status === 'open') {
          const priceData = prices[station.stationId]
          for (const type of GAS_TYPES) {
            if (priceData[type]) {
              alerts = alerts.concat(await updatePrices(station, type, priceData[type]))
            }
          }
        }
      }
    }
  }

  return alerts
}

async function updatePrices(station, type, price) {
  const priceSnapshot = new PriceSnapshot({
    timestamp: new Date(),
    price
  })

  const lowestStats: number = station.stats[type].lowest
  const lastPrice: number = station[type].sort((a, b) => b.timestamp - a.timestamp)[0]?.price
  const alerts: Alert[] = []

  let hasAlert = false;
  [30, 7, 3, 1].forEach(t => {
    if (lowestStats[t] !== Number.POSITIVE_INFINITY && lowestStats[t] > price && !hasAlert) {
      alerts.push({
        stationId: station.stationId,
        type,
        days: t,
        lastPrice: lowestStats[t],
        newPrice: price,
        level: AlertLevel.STANDARD
      })
      hasAlert = true
    }
  })

  // if minimum of last 24h is reached
  if ((lowestStats[1] === price) && (price !== lastPrice)) {
    alerts.push({
      stationId: station.stationId,
      type,
      days: 1,
      lastPrice: lowestStats[1],
      newPrice: price,
      level: AlertLevel.REPEAT
    })
  }

  station[type].unshift(priceSnapshot)

  station.stats[type].lowest = new PriceStats({
    1: calculateLowest(station, type, 1),
    3: calculateLowest(station, type, 3),
    7: calculateLowest(station, type, 7),
    30: calculateLowest(station, type, 30),
  })

  station.stats[type].average = new PriceStats({
    1: calculateAverage(station, type, 1),
    3: calculateAverage(station, type, 3),
    7: calculateAverage(station, type, 7),
    30: calculateAverage(station, type, 30),
  })

  await station.save()
  return alerts
}

function calculateLowest(station, type, days) {
  const deltaMs = days * MILLIS_DAY
  const minPrice = Math.min(...(station[type].filter(p => Date.now() - Date.parse(p.timestamp) < deltaMs).map(p => p.price)))
  return minPrice
}

function calculateAverage(station, type, days) {
  const deltaMs = days * MILLIS_DAY
  const prices = station[type].filter(p => Date.now() - Date.parse(p.timestamp) < deltaMs).map(p => p.price)
  const average = prices.reduce((a, b) => a + b, 0) / prices.length
  return Number.parseFloat(average.toFixed(3))
}

async function removeSnapshots() {
  const deltaMs = 31 * MILLIS_DAY
  const gasStations = await GasStation.find().exec()
  await gasStations.forEach(async s => {
    GAS_TYPES.forEach(async t => {
      s[t] = s[t].filter(snapshot => (Date.now() - Date.parse(snapshot.timestamp)) < deltaMs)
    })
    await s.save()
  })
}

export async function updateAndNotify() {
  console.log(`${new Date()} - updating prices`)
  const alerts: Alert[] = await fetchPrices()
  console.log(`${new Date()} - ${alerts.length} new alerts`)
  await notifyAboutAlerts(alerts)
  await removeSnapshots()
}


export function configureUpdates() {
  cron.schedule(`*/${UPDATE_CYCLE} * * * *`, () => {
    updateAndNotify()
  })
}
