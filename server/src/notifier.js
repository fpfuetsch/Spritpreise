const fetch = require('node-fetch');

const GasStation = require('./model').GasStation;
const PriceSnapshot = require('./model').PriceSnapshot;
const LowestPriceStats = require('./model').LowestPriceStats;
const Subscription = require('./model').Subscription;

const baseURL= 'https://creativecommons.tankerkoenig.de/json/';
const apiKey = process.env.API_KEY;

const telegram_token = process.env.TELEGRAM_TOKEN;
const telegram_chat = process.env.TELEGRAM_CHAT;
const telegram_chat_url = `https://api.telegram.org/bot${telegram_token}/sendMessage?chat_id=${telegram_chat}&parse_mode=html&text=`;

const fetchPrices = async () => {

  let alarms = [];
  let gasStations = await GasStation.find().exec();
  let gasStationIds = gasStations.map(station => station.stationId);

  const urlPrices = `${baseURL}prices.php?ids=${gasStationIds.join(',')}&apikey=${apiKey}`;
  const data = await fetch(urlPrices).then(result => result.json()).catch(err => console.error(err));

  if (data != undefined && data.ok) {
    let prices = data.prices;
    for (let i = 0; i<gasStations.length; i++) {
      const s = gasStations[i];
      if (prices[s.stationId] != undefined && prices[s.stationId].status == 'open') {
        const data = prices[s.stationId];
        for (let type of ['e5', 'e10', 'diesel']) {
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
  station.stats[type].lowest = new LowestPriceStats({
    1: calculateLowest(station, type, 1),
    3: calculateLowest(station, type, 3),
    7: calculateLowest(station, type, 7),
    30: calculateLowest(station, type, 30),
  });

  await station.save();
  return alarms;
};

const calculateLowest = (station, type, days) => {
  const earliestDate = Date.now() - (days * 24 * 60 * 60 * 1000);
  const minPrice = Math.min(...(station[type].filter(p => Date.now() - Date.parse(p.timestamp) < earliestDate).map(p => p.price)));
  return minPrice;
};

const generateMessageText = async (alerts, stationId, type) => {
  const station = await GasStation.findOne({stationId: stationId}).exec();
  let text = `Benachrichtigung für ${station.name} ${station.street}, Krafstoff: ${type.toUpperCase()}.LF`;
  alerts.forEach(a => {
    text += `LFNeues Minimum für Zeitraum: ${a.days} Tag(e)LF`;
    text += `Vorheriges Minimum: <b>${a.lastLowest}€</b>LF`;
    text += `Neues Minimum: <b>${a.newLowest}€</b>LF`;
  });
  text = encodeURIComponent(text);
  text = text.replace(/LF/g, '%0A');
  return text;
};

const notifySubscribers = async (alarms) => {
  const subsciptions = await Subscription.find().exec();
  subsciptions.forEach(async s => {
    const matches = alarms.filter(a => a.stationId == s.stationId && a.type == s.type);
    if (matches.length > 0) {
      await fetch(telegram_chat_url + await generateMessageText(matches, s.stationId, s.type)).then(result => result.json());
    }
  });
};

const removeSnapshots = async () => {
  let exeedingMs = 31 * 24 * 60 * 60 * 1000;
  let gasStations = await GasStation.find().exec();
  await gasStations.forEach(async s => {
    ['e5', 'e10', 'diesel'].forEach(async t => {
      s[t] = s[t].filter(snapshot => (Date.now() - Date.parse(snapshot.timestamp)) < exeedingMs);
    });
    await s.save();
  });
};

const updateAndNotify = async () => {
  console.log(`${new Date()} - updating prices`);
  const alerts = await fetchPrices();
  console.log(`${new Date()} - ${alerts.length} new alters`);
  await notifySubscribers(alerts);
  await removeSnapshots();
};

module.exports = updateAndNotify;
