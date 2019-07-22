const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

const GasStation = require('./model').GasStation;
const PriceSnapshot = require('./model').PriceSnapshot;

const baseURL= 'https://creativecommons.tankerkoenig.de/json/';
const apiKey = process.env.API_KEY;

router.get('/update', async (req, res) => {
  let gasStations = await GasStation.find().exec();

  gasStationIds = gasStations.map(station => station.stationId);

  const urlPrices = `${baseURL}prices.php?ids=${gasStationIds.join(',')}&apikey=${apiKey}`;
  const data = await fetch(urlPrices).then(result => result.json()).catch(err => res.send(err));

  if(data != undefined && data.ok) {
    let prices = data.prices;
    await gasStations.forEach(async s => {
      if(prices[s.stationId] != undefined && prices[s.stationId].status == 'open'){
        let data = prices[s.stationId];
        let priceSnapshot;
        if(data.e5) {
          priceSnapshot = new PriceSnapshot({
            timestamp: new Date(),
            price: data.e5
          });
          s.e5.push(priceSnapshot);
        }
        if(data.e10) {
          priceSnapshot = new PriceSnapshot({
            timestamp: new Date(),
            price: data.e10
          });
          s.e10.push(priceSnapshot);
        }
        if(data.diesel) {
          priceSnapshot = new PriceSnapshot({
            timestamp: new Date(),
            price: data.diesel
          });
          s.diesel.push(priceSnapshot);
        }
        await s.save(err => {
          if(err) {
            res.send(err);
          }
          console.log(`Station updated: ${s.stationId} - ${new Date().toLocaleTimeString()}`);
        });
      }
    });
    res.send(data)
  } else {
    res.send('Fehler!')
  }
});

router.get('/addNewStation', async (req, res) => {
  const id = req.query.id;

  if(id == undefined) {
    res.send('No station id provided!')
    return;
  }

  const alreadyExists = await GasStation.exists({stationId: id});

  if(alreadyExists) {
    res.send('Station already exists.')
    return;
  }

  const url = `${baseURL}detail.php?id=${id}&apikey=${apiKey}`;
  const data = await fetch(url).then(res => res.json()).catch(err => console.error(err));
  if(data != undefined && data.ok) {
    const station = new GasStation({
      stationId: data.station.id,
      name: data.station.name.trim(),
      brand: data.station.brand.trim(),
      street: data.station.street.trim(),
      city: data.station.place.trim(),
      lat: data.station.lat,
      lng: data.station.lng
    });
    station.save(err => {
      if(err) {
        res.send(err);
      }
      console.log('New Station persisted!')
      res.send('Persited!')
    });
  } else {
    res.send('Fehler!')
  }
});

module.exports = router;