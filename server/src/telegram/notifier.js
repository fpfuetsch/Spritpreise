const fetch = require('node-fetch');
const GasStation = require('../model').GasStation;
const Subscription = require('../model').Subscription;

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_BASE_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?`;

const notifySubscribers = async (alarms) => {
  const subsciptions = await Subscription.find().exec();
  subsciptions.forEach(async s => {
    const matches = alarms.filter(a => a.stationId == s.stationId && a.type == s.type);
    if (matches.length > 0) {
      await sendTelegramMessage(s.chatId, await generateAlertText(matches, s.stationId, s.type));
    }
  });
};

const sendTelegramMessage = async (chatId, message, ) => {
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

module.exports.notifySubscribers = notifySubscribers;
module.exports.sendTelegramMessage = sendTelegramMessage;
