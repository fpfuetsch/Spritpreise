const fetch = require('node-fetch');
const GasStation = require('../model').GasStation;
const Subscription = require('../model').Subscription;

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_BASE_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?`;

const notifyAlerts = async (alarms) => {
  const subsciptions = await Subscription.find().exec();
  subsciptions.forEach(async s => {
    const matches = alarms.filter(a => a.stationId == s.stationId && a.type == s.type);
    if (matches.length > 0) {
      await sendTelegramMessage(s.chatId, await generateAlertText(matches, s.stationId, s.type));
    }
  });
};

const notifyStatus = async (chatId) => {
  const subscriptions = await Subscription.find({chatId: chatId}).exec();
  let text = '';
  if (subscriptions.length == 0) {
    text += 'Keine Abonnements!';
  } else {
    for (let s of subscriptions) {
      text += await generateStatusText(s.stationId, s.type);
    }
  }
  await sendTelegramMessage(chatId, text);
};

const sendTelegramMessage = async (chatId, message) => {
  message = encodeURIComponent(message).replace(/LF/g, '%0A');
  await fetch(`${TELEGRAM_CHAT_BASE_URL}chat_id=${chatId}&parse_mode=html&text=${message}`);
};

const generateAlertText = async (alerts, stationId, type) => {
  const station = await GasStation.findOne({stationId: stationId}).exec();
  let text = `Benachrichtigung für ${station.name} ${station.street}, Krafstoff: ${type.toUpperCase()}.LF`;
  alerts.forEach(a => {
    text += `LFNeues Minimum für Zeitraum: ${a.days} Tag(e)LF`;
    text += `Vorheriges Minimum: <b>${a.lastLowest}€</b>LF`;
    text += `Neues Minimum: <b>${a.newLowest}€</b>LF`;
  });
  return text;
};

const generateStatusText = async (stationId, type) => {
  const station = await GasStation.findOne({stationId: stationId}).exec();
  let text = `LFStatus für ${station.name} ${station.street}, Krafstoff: ${type.toUpperCase()}.LF`;

  if (station[type].length != 0) {
    const latestSnapshot = station[type].sort((a, b) => Date.parse(a.timestamp) > Date.parse(b.timestamp))[0];
    const minutesAgo = Number.parseInt((Date.now() - Date.parse(latestSnapshot.timestamp)) / (60 * 1000));
    text += `LFLetzter Preis: ${latestSnapshot.price}€ (vor ${minutesAgo}min)LF`;
  } else {
    text += `LFLetzter Preis: nicht vorhandenLF`;
  }
  text += `Minimum / DurchschnittLF`;
  text += `24h: ${station.stats[type].lowest['1']}€ / ${station.stats[type].average['1']}€LF`;
  text += `3d: ${station.stats[type].lowest['3']}€ / ${station.stats[type].average['3']}€LF`;
  text += `7d: ${station.stats[type].lowest['7']}€ / ${station.stats[type].average['7']}€LF`;
  text += `30d: ${station.stats[type].lowest['30']}€ / ${station.stats[type].average['30']}€LF`;
  return text;
};

module.exports.notifyAlerts = notifyAlerts;
module.exports.notifyStatus = notifyStatus;
module.exports.sendTelegramMessage = sendTelegramMessage;
