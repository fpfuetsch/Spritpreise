const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let database;

const SnapshotSchema = new Schema({
  stationId: String,
  name: String,
  timestamp: Date,
  price: Number
});

const SnapshotModel = mongoose.model('DieselSnapshot', SnapshotSchema);

const connect = (host, port, db) => {
  const url = `mongodb://${host}:${port}/${db}`
  mongoose.connect(url, { useNewUrlParser: true });
  database = mongoose.connection;
  console.log(`Successfully connected to database: ${db} at ${host}:${port}/${db}`);
};

module.exports.db = database;
module.exports.establishConnection = connect;
module.exports.SnapshotModel = SnapshotModel;
