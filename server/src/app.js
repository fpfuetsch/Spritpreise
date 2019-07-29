require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors')
const router = require('./router');
const establishDBConnection = require('./database').establishConnection;
const PORT = process.env.SERVER_PORT || 8080;
const BASE_PATH = process.env.BASE_PATH || '/.netlify/functions/api'

app.use(cors());
app.use(BASE_PATH, router);

establishDBConnection();

if(process.env.IS_SERVER) {
  app.listen(PORT, function () {
    console.log(`App listening on port ${PORT} with path ${BASE_PATH}!`);
  });
}

module.exports = app;