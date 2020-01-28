require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const router = require('./router');
const cron = require('node-cron');
const mongoose = require('mongoose');

const BASE_PATH = process.env.API_BASE_PATH || '/api';
const DB_URL = process.env.DB_URL;
const PORT = process.env.SERVER_PORT || 8080;
const UPDATE_CYCLE = process.env.UPDATE_CYCLE || 15;

const updateAndNotify = require('./data/update').updateAndNotify;

const createApp = async () => {
  await mongoose.connect(DB_URL, { useNewUrlParser: true });
  console.log(`Successfully connected to database: ${DB_URL}`);

  app.use(cors());
  app.use(express.json());
  app.use(BASE_PATH, router);

  cron.schedule(`*/${UPDATE_CYCLE} * * * *`, () => {
    updateAndNotify();
  });

  return app;
};

createApp().then(app => app.listen(PORT, function () {
  console.log(`App listening on port ${PORT}!`);
}));