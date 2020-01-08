const fetch = require('node-fetch');
const nodemailer = require("nodemailer");

const GasStation = require('./model').GasStation;
const PriceSnapshot = require('./model').PriceSnapshot;
const LowestPriceStats = require('./model').LowestPriceStats;
const Subscription = require('./model').Subscription;

const baseURL= 'https://creativecommons.tankerkoenig.de/json/';
const apiKey = process.env.API_KEY;

const fetchPrices = async () => {

  let alarms = [];
  let gasStations = await GasStation.find().exec();
  let gasStationIds = gasStations.map(station => station.stationId);

  const urlPrices = `${baseURL}prices.php?ids=${gasStationIds.join(',')}&apikey=${apiKey}`;
  const data = await fetch(urlPrices).then(result => result.json()).catch(err => console.error(err));

  if (data != undefined && data.ok) {
    let prices = data.prices;
    await Promise.all(gasStations.map(async s => {
      if (prices[s.stationId] != undefined && prices[s.stationId].status == 'open') {
        const data = prices[s.stationId];
        for (let type of ['e5', 'e10', 'diesel']) {
          if (data[type]) {
            alarms = alarms.concat(await updatePrices(s, type, data[type]));
          }
        }
      }
    }));
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

const generateMailText = async (alerts, stationId, type) => {
  const station = await GasStation.findOne({stationId: stationId}).exec();
  let text = `Benachrichtigung für ${station.name} ${station.street}, Krafstoff: ${type.toUpperCase()}.\n\n`;
  alerts.forEach(a => {
    text += `Neues Minimum für Zeitraum: ${a.days} Tag(e)\n`;
    text += `Vorheriges Minimum: ${a.lastLowest}\n`;
    text += `Neues Minimum: ${a.newLowest}\n\n`;
  });
  return text;
};

const notifySubscribers = async (alarms) => {
  const subsciptions = await Subscription.find().exec();

  subsciptions.forEach(async s => {
    const matches = alarms.filter(a => a.stationId == s.stationId && a.type == s.type);

    const transporter = nodemailer.createTransport({
      host: "mail",
      port: 25,
      secure: false,
    });

    if (matches.length > 0) {

      console.log(`Sending mail to ${s.mail}`);

      // send mail with defined transport object
      await transporter.sendMail({
        from: '"Fabian 👻" <spritpreis-alarm@pfuetsch.xyz>', // sender address
        to: s.mail, // list of receivers
        subject: "Spritpreis-Alarm!", // Subject line
        text: await generateMailText(matches, s.stationId, s.type) // plain text body
      });
    }
  });
};

const removeSnapshots = async () => {
  console.log('Removing PriceSnapshots that are older than 31 days...');
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
  console.log('Updating prices and notifying subscribers...');
  await notifySubscribers(await fetchPrices());
  await removeSnapshots();
};

module.exports = updateAndNotify;
