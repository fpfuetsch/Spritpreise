const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const SnapshotModel = require('./db_controller').SnapshotModel;

const baseURL= 'https://creativecommons.tankerkoenig.de/json/detail.php';
const id = '9e028191-ac05-46b8-a58b-6161a8452453'
const apiKey = process.env.API_KEY;
const url = `${baseURL}?id=${id}&apikey=${apiKey}`;

router.get('/update', async (req, res) => {
  const data = await fetch(url).then(result => result.json()).catch(err => res.send(err));
  const station = data.station;
  const snapshot = new SnapshotModel({
      stationId: station.id,
      name: station.name + station.street,
      price: station.diesel,
      timestamp: new Date()
  });
  snapshot.save(function (err) {
    if (err) return handleError(err);
    console.log('New snapshot persisted.')
  });
  res.send('Snapshot persisted ' + station.diesel);
});

module.exports = router;