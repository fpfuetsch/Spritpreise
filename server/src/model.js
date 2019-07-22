const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const priceSnapshotSchema = new Schema({
  timestamp: Date,
  price: Number
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
  diesel: [priceSnapshotSchema]
});


const PriceSnapshot = mongoose.model('PriceSnapshot', priceSnapshotSchema);
const GasStation = mongoose.model('GasStation', gasStationSchema);

module.exports.PriceSnapshot = PriceSnapshot;
module.exports.GasStation = GasStation;