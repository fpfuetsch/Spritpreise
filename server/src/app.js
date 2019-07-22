require('dotenv').config();
const express = require('express');
const app = express();
const router = require('./router');
const establishDBConnection = require('./database').establishConnection;
const PORT = process.env.SERVER_PORT || 8080;

app.use(router);

app.listen(PORT, function () {
  console.log(`App listening on port ${PORT}!`);
  establishDBConnection('localhost', 27017, 'Spritpreise');
});