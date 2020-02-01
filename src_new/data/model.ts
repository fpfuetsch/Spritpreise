import * as mongoose from 'mongoose'
import { Schema } from 'mongoose'

export const BASE_URL = 'https://creativecommons.tankerkoenig.de/json/'

export enum AlertLevel {
  STANDARD, REPEAT
}

export interface Alert {
    stationId: Number
    type: String,
    days: Number,
    lastPrice: Number,
    newPrice: Number,
    level: AlertLevel
}

const subscriptionSchema = new Schema({
  stationId: String,
  type: String,
  chatId: Number
})

const priceSnapshotSchema = new Schema({
  timestamp: Date,
  price: Number
})

const priceStatsSchema = new Schema({
  1: Number,
  3: Number,
  7: Number,
  30: Number
})

const gasTypeStatsSchema = new Schema({
  lowest: priceStatsSchema,
  average: priceStatsSchema,
})

const statsSchema = new Schema({
  e5: gasTypeStatsSchema,
  e10: gasTypeStatsSchema,
  diesel: gasTypeStatsSchema,
})

const gasStationSchema = new Schema({
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

export const PriceSnapshot = mongoose.model('PriceSnapshot', priceSnapshotSchema)
export const Stats = mongoose.model('Stats', statsSchema)
export const GasTypeStats = mongoose.model('GasTypeStats', gasTypeStatsSchema)
export const PriceStats = mongoose.model('LowestPriceStats', priceStatsSchema)
export const GasStation = mongoose.model('GasStation', gasStationSchema)
export const Subscription = mongoose.model('Subscription', subscriptionSchema)