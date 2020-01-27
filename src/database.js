const mongoose = require('mongoose');
const DB_URL = process.env.DB_URL;
let database;

const connect = async () => {
  await mongoose.connect(DB_URL, { useNewUrlParser: true });
  database = mongoose.connection;
  console.log(`Successfully connected to database: ${DB_URL}`);
};

module.exports.db = database;
module.exports.establishConnection = connect;