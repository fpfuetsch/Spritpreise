require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const router = require('./router');
const establishDBConnection = require('./database').establishConnection;
const BASE_PATH = process.env.API_BASE_PATH || '/api';

establishDBConnection();
app.use(cors());
app.use(BASE_PATH, router);

module.exports = app;