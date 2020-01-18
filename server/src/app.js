require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const router = require('./router');
const establishDBConnection = require('./database').establishConnection;
const BASE_PATH = process.env.API_BASE_PATH || '/api';
const cron = require('node-cron');

const updateAndNotify = require('./telegram/notifier').updateAndNotify;

const createApp = async () => {
  await establishDBConnection();
  app.use(cors());
  app.use(express.json());
  app.use(BASE_PATH, router);

  cron.schedule('*/15 * * * *', () => {
    updateAndNotify();
  });

  return app;
};

module.exports = createApp;