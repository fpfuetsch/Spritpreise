require('dotenv').config();
const express = require('express');
const app = express();
const router = require('./router');
const establishDBConnection = require('./db_controller').establishConnection;

app.use(router);

app.listen(3000, function () {
  console.log('App listening on port 3000!');
  establishDBConnection('localhost', 27017, 'Spritpreise');
});