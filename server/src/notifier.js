const fetch = require('node-fetch');
const nodemailer = require("nodemailer");

const GasStation = require('./model').GasStation;
const PriceSnapshot = require('./model').PriceSnapshot;
const LowestPriceStats = require('./model').LowestPriceStats;
const Subscription = require('./model').Subscription;

const baseURL= 'https://creativecommons.tankerkoenig.de/json/';
const apiKey = process.env.API_KEY;

const fetchPrices = async () => {
  let gasStations = await GasStation.find().exec();

  let gasStationIds = gasStations.map(station => station.stationId);

  const urlPrices = `${baseURL}prices.php?ids=${gasStationIds.join(',')}&apikey=${apiKey}`;
  const data = await fetch(urlPrices).then(result => result.json()).catch(err => console.error(err));

  let alarms = [];

  if (data != undefined && data.ok) {
    let prices = data.prices;
    await Promise.all(gasStations.map(async s => {
      if (prices[s.stationId] != undefined && prices[s.stationId].status == 'open') {
        let data = prices[s.stationId];
        const eps = 0;
        if (data.e5) {

          alarms = alarms.concat(await updatePrices(s, 'e5', data.e5 - eps));
        }
        if (data.e10) {
          alarms = alarms.concat(await updatePrices(s, 'e10', data.e10 - eps));
        }
        if (data.diesel) {
          alarms = alarms.concat(await updatePrices(s, 'diesel', data.diesel -eps));
        }
        await s.save();
      }
    }));
    return alarms;
  } else {
    console.error('Fehler!');
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

  const times = ['3', '7', '30'];
  times.forEach(t => {
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
    3: calculateLowest(station, type, 3),
    7: calculateLowest(station, type, 7),
    30: calculateLowest(station, type, 30),
  });

  await station.save();
  return alarms;
};

const calculateLowest = (station, type, days) => {
  const earliestDate = Date.now() - (days * 24 * 60 * 60 * 1000);
  const minPrice = Math.min(...(station[type].filter(p => Date.parse(p.timestamp) - earliestDate > 0).map(p => p.price)));
  return minPrice;
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

      // send mail with defined transport object
      const info = await transporter.sendMail({
        from: '"Fabian 👻" <spritpreis-alarm@pfuetsch.xyz>', // sender address
        to: s.mail, // list of receivers
        subject: "Spritpreis-Alarm!", // Subject line
        text: JSON.stringify(matches), // plain text body
      });

      console.log("Message sent: %s", info.messageId);
    }
  });
};

const updateAndNotify = async () => {
  const alarms = await fetchPrices();
  console.log('alarms: ', alarms);
  notifySubscribers(alarms);
};


module.exports = updateAndNotify;
