const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subscriptionSchema = new Schema({
  stationId: String,
  type: String,
  chatId: Number
});

const priceSnapshotSchema = new Schema({
  timestamp: Date,
  price: Number
});

const priceStatsSchema = new Schema({
  1: Number,
  3: Number,
  7: Number,
  30: Number
});

const gasTypeStatsSchema = new Schema({
  lowest: priceStatsSchema,
  average: priceStatsSchema,
});

const statsSchema = new Schema({
  e5: gasTypeStatsSchema,
  e10: gasTypeStatsSchema,
  diesel: gasTypeStatsSchema,
});

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
});

const PriceSnapshot = mongoose.model('PriceSnapshot', priceSnapshotSchema);
const Stats = mongoose.model('Stats', statsSchema);
const GasTypeStats = mongoose.model('GasTypeStats', gasTypeStatsSchema);
const PriceStats = mongoose.model('LowestPriceStats', priceStatsSchema);
const GasStation = mongoose.model('GasStation', gasStationSchema);

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports.PriceSnapshot = PriceSnapshot;
module.exports.GasStation = GasStation;
module.exports.Stats = Stats;
module.exports.GasTypeStats = GasTypeStats;
module.exports.PriceStats = PriceStats;

module.exports.Subscription = Subscription;