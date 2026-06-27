import * as mongoose from 'mongoose'
import { Schema } from 'mongoose'

export const BASE_URL = 'https://creativecommons.tankerkoenig.de/json/'
export const GAS_TYPES = ['e5', 'e10', 'diesel']

export enum AlertLevel {
  STANDARD, REPEAT
}

export interface Alert {
    stationId: string,
    type: string,
    days: number,
    lastPrice: number,
    newPrice: number,
    level: AlertLevel
}

const subscriptionSchema = new Schema<any>({
  stationId: String,
  type: String,
  chatId: Number,
  active: Boolean
})

const priceSnapshotSchema = new Schema<any>({
  timestamp: Date,
  price: Number
})

const priceStatsSchema = new Schema<any>({
  1: Number,
  3: Number,
  7: Number,
  30: Number
})

const gasTypeStatsSchema = new Schema<any>({
  lowest: priceStatsSchema,
  average: priceStatsSchema,
})

const statsSchema = new Schema<any>({
  e5: gasTypeStatsSchema,
  e10: gasTypeStatsSchema,
  diesel: gasTypeStatsSchema,
})

const gasStationSchema = new Schema<any>({
  stationId: String,
  name: String,
  brand: String,
  street: String,
  city: String,
  lat: Number,
  lng: Number,
  e5: [priceSnapshotSchema],
  e10: [priceSnapshotSchema],
  diesel: [priceSnapshotSchema],
  stats: statsSchema
})

export const PriceSnapshot: any = mongoose.model('PriceSnapshot', priceSnapshotSchema)
export const Stats: any = mongoose.model('Stats', statsSchema)
export const GasTypeStats: any = mongoose.model('GasTypeStats', gasTypeStatsSchema)
export const PriceStats: any = mongoose.model('LowestPriceStats', priceStatsSchema)
export const GasStation: any = mongoose.model('GasStation', gasStationSchema)
export const Subscription: any = mongoose.model('Subscription', subscriptionSchema)
