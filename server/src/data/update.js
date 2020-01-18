
const fetch = require('node-fetch');
const PriceSnapshot = require('../model').PriceSnapshot;
const PriceStats = require('../model').PriceStats;
const GasStation = require('../model').GasStation;
const Stats = require('../model').Stats;
const GasTypeStats = require('../model').GasTypeStats;
const notifyAlerts = require('../telegram/notifier').notifyAlerts;

const BASE_URL= 'https://creativecommons.tankerkoenig.de/json/';
const API_KEY = process.env.API_KEY;
const GAS_TYPES = ['e5', 'e10', 'diesel'];

const fetchPrices = async () => {
  let alarms = [];
  let gasStations = await GasStation.find().exec();
  let gasStationIds = gasStations.map(station => station.stationId);

  const urlPrices = `${BASE_URL}prices.php?ids=${gasStationIds.join(',')}&apikey=${API_KEY}`;
  const data = await fetch(urlPrices).then(result => result.json()).catch(err => console.error(err));

  if (data != undefined && data.ok) {
    let prices = data.prices;
    for (let i = 0; i<gasStations.length; i++) {
      const s = gasStations[i];
      if (prices[s.stationId] != undefined && prices[s.stationId].status == 'open') {
        const data = prices[s.stationId];
        for (let type of GAS_TYPES) {
          if (data[type]) {
            alarms = alarms.concat(await updatePrices(s, type, data[type]));
          }
        }
      }
    }
    return alarms;
  } else {
    return [];
  }
};

const updatePrices = async (station, type, price) => {
  const priceSnapshot = new PriceSnapshot({
    timestamp: new Date(),
    price: price
  });

  const lowestStats = station.stats[type].lowest;
  const alarms = [];

  ['1', '3', '7', '30'].forEach(t => {
    if (lowestStats[t] > price) {
      alarms.push({
        stationId: station.stationId,
        type: type,
        days: Number.parseInt(t),
        lastLowest: lowestStats[t],
        newLowest: priceSnapshot.price
      });
    }
  });

  station[type].unshift(priceSnapshot);
  station.stats[type].lowest = new PriceStats({
    1: calculateLowest(station, type, 1),
    3: calculateLowest(station, type, 3),
    7: calculateLowest(station, type, 7),
    30: calculateLowest(station, type, 30),
  });
  station.stats[type].average = new PriceStats({
    1: calculateAverage(station, type, 1),
    3: calculateAverage(station, type, 3),
    7: calculateAverage(station, type, 7),
    30: calculateAverage(station, type, 30),
  });

  await station.save();
  return alarms;
};

const calculateLowest = (station, type, days) => {
  const deltaMs = days * 24 * 60 * 60 * 1000;
  const minPrice = Math.min(...(station[type].filter(p => Date.now() - Date.parse(p.timestamp) < deltaMs).map(p => p.price)));
  return minPrice;
};

const calculateAverage = (station, type, days) => {
  const deltaMs = days * 24 * 60 * 60 * 1000;
  const prices = station[type].filter(p => Date.now() - Date.parse(p.timestamp) < deltaMs).map(p => p.price);
  const average = prices.reduce((a, b) => a + b, 0) / prices.length;
  return Number.parseFloat(average.toFixed(3));
};

const removeSnapshots = async () => {
  let deltaMs = 31 * 24 * 60 * 60 * 1000;
  let gasStations = await GasStation.find().exec();
  await gasStations.forEach(async s => {
    GAS_TYPES.forEach(async t => {
      s[t] = s[t].filter(snapshot => (Date.now() - Date.parse(snapshot.timestamp)) < deltaMs);
    });
    await s.save();
  });
};

const updateAndNotify = async () => {
  console.log(`${new Date()} - updating prices`);
  const alerts = await fetchPrices();
  console.log(`${new Date()} - ${alerts.length} new alters`);
  await notifyAlerts(alerts);
  await removeSnapshots();
};

const persistStation = async (stationId) => {
  const alreadyExists = await GasStation.exists({stationId: stationId});

  if (alreadyExists) {
    return 'conflict';
  }

  const url = `${BASE_URL}detail.php?id=${stationId}&apikey=${API_KEY}`;
  const data = await fetch(url).then(res => res.json()).catch(err => console.error(err));

  if (data != undefined && data.ok) {
    const priceStats = new PriceStats ({
      1: 100,
      3: 100,
      7: 100,
      30: 100
    });

    const gasTypeStats = new GasTypeStats({
      lowest: priceStats,
      average: priceStats,
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

    await station.save(async err => {
      if (err) {
        console.error(err);
        return 'error';
      }
      console.log('New Station persisted!');
      return 'done';
    });

  } else {
    return 'not found';
  }
};

module.exports.persistStation = persistStation;
module.exports.updateAndNotify = updateAndNotify;