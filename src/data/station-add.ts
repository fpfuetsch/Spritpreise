import fetch from 'node-fetch'
import { BASE_URL, GasStation, GasTypeStats, PriceStats, Stats } from './model'
import { fetchPrices } from './price-update'

const API_KEY = process.env.API_KEY

export enum Response {
  CONFLICT, DONE, NOT_FOUND
}

export async function persistStation (stationId: number): Promise<Response> {
  const alreadyExists: boolean = await GasStation.exists({stationId})

  if (alreadyExists) {
    return Response.CONFLICT
  }

  const url = `${BASE_URL}detail.php?id=${stationId}&apikey=${API_KEY}`
  const data = await fetch(url).then(res => res.json()).catch(err => console.error(err))

  if (data !== undefined && data.ok) {
    const priceStats = new PriceStats ({
      1: Number.POSITIVE_INFINITY,
      3: Number.POSITIVE_INFINITY,
      7: Number.POSITIVE_INFINITY,
      30: Number.POSITIVE_INFINITY,
    })

    const gasTypeStats = new GasTypeStats({
      lowest: priceStats,
      average: priceStats,
    })

    const stats = new Stats({
      e5: gasTypeStats,
      e10: gasTypeStats,
      diesel: gasTypeStats
    })

    const station = new GasStation({
      stationId: data.station.id,
      name: data.station.name.trim(),
      brand: data.station.brand.trim(),
      street: data.station.street.trim(),
      city: data.station.place.trim(),
      lat: data.station.lat,
      lng: data.station.lng,
      stats
    })

    await station.save()
    console.log('New station tracked')

    await fetchPrices()
    console.log('Updating prices')

    return Response.DONE
  } else {
    return Response.NOT_FOUND
  }
}
