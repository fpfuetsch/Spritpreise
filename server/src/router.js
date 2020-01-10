const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

const GasStation = require('./model').GasStation;
const Stats = require('./model').Stats;
const GasTypeStats = require('./model').GasTypeStats;
const LowestPriceStats = require('./model').LowestPriceStats;
const Subscription = require('./model').Subscription;
const updateAndNotify = require('./notifier');

const baseURL= 'https://creativecommons.tankerkoenig.de/json/';
const apiKey = process.env.API_KEY;

router.post('/telegram/updates', async (req, res) => {
  console.log(req.body);
  res.send('ok');
});

router.get('/analyze', async (req, res) => {
  updateAndNotify();
  res.send('done');
});

router.post('/subscription', async (req, res) => {
  const id = req.query.id;
  const type = req.query.type;

  if (!id || !type) {
    res.statusCode = 400;
    res.statusMessage ='Bad Request';
    res.send();
    return;
  }

  if (await Subscription.exists({stationId: id, type: type})) {
    res.statusCode = 409;
    res.statusMessage ='Already exists!';
    res.send();
    return;
  }

  const subscription = new Subscription({
    stationId: id,
    type: type
  });

  await subscription.save(err => {
    if (err) {
      res.send(err);
      return;
    }
    console.log('New Subscription persisted!');
    res.statusMessage = 'Persited!';
    res.send();
  });
});

router.delete('/subscription', async (req, res) => {
  const id = req.query.id;
  const type = req.query.type;

  if (!id || !type) {
    res.statusCode = 400;
    res.statusMessage ='Bad Request';
    res.send();
    return;
  }

  await Subscription.deleteOne({stationId: id, type: type}).exec();

  console.log('Subscription deleted!');
  res.statusMessage = 'Deleted!';
  res.send();
});

router.post('/station', async (req, res) => {
  const id = req.query.id;

  if (id == undefined) {
    res.statusCode = 400;
    res.statusMessage ='Bad Request: No station id provided!';
    res.send();
    return;
  }

  const alreadyExists = await GasStation.exists({stationId: id});

  if (alreadyExists) {
    res.statusCode = 200;
    res.statusMessage = 'Station already exists.';
    res.send();
    return;
  }

  const url = `${baseURL}detail.php?id=${id}&apikey=${apiKey}`;
  const data = await fetch(url).then(res => res.json()).catch(err => console.error(err));
  if (data != undefined && data.ok) {
    const lowestPriceStats = new LowestPriceStats ({
      1: 100,
      3: 100,
      7: 100,
      30: 100
    });

    const gasTypeStats = new GasTypeStats({
      lowest: lowestPriceStats
    });

    let stats = new Stats({
      e5: gasTypeStats,
      e10: gasTypeStats,
      diesel: gasTypeStats
    });

    const station = new GasStation({
      stationId: data.station.id,
      name: data.station.name.trim(),
      brand: data.station.brand.trim(),
      street: data.station.street.trim(),
      city: data.station.place.trim(),
      lat: data.station.lat,
      lng: data.station.lng,
      stats: stats
    });

    await station.save(err => {
      if (err) {
        res.send(err);
        return;
      }
      console.log('New Station persisted!');
      res.statusMessage = 'Persited!';
      res.send();
    });

  } else {
    res.statusCode = 400;
    res.statusMessage = 'Station konnte nicht gefunden werden!';
    res.send();
  }
});

module.exports = router;