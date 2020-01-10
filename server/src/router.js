const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

const GasStation = require('./model').GasStation;
const Stats = require('./model').Stats;
const GasTypeStats = require('./model').GasTypeStats;
const LowestPriceStats = require('./model').LowestPriceStats;
const Subscription = require('./model').Subscription;
const sendTelegramMessage = require('./notifier').sendTelegramMessage;

const baseURL= 'https://creativecommons.tankerkoenig.de/json/';
const apiKey = process.env.API_KEY;
const telegram_token = process.env.TELEGRAM_TOKEN;

router.post('/telegram/updates/:token', async (req, res) => {
  const message = req.body.message;
  const token = req.params.token;

  if (token != telegram_token) {
    res.statusCode = 403;
    res.send();
    return;
  }

  if (!message) {
    console.log('No message in update incuded!');
    res.send();
    return;
  }
  const chat = message.chat;
  if (message.text.startsWith('/start')) {
    await sendTelegramMessage(chat.id, 'Seid gegrüßt!');
  } else if (message.text.startsWith('/stop')) {
    await removeAllSubscriptions(chat.id);
  } else if (message.text.startsWith('/stations')) {
    await listStations(chat.id);
  } else if (message.text.startsWith('/add_station')) {
    await addStations(chat.id, message.text);
  } else if (message.text.startsWith('/subs')) {
    await listSubscriptions(chat.id);
  } else if (message.text.startsWith('/add_sub')) {
    await addSubscription(chat.id, message.text);
  } else if (message.text.startsWith('/remove_sub')) {
    await removeSubscription(chat.id, message.text);
  }
  res.send();
});

const listStations = async (chatId) => {
  let res = '';
  const stations = await GasStation.find({}, {stationId: 1, name: 1, street: 1});
  if (stations.length == 0) {
    await sendTelegramMessage(chatId, 'Keine vorhanden!');
  }
  stations.forEach(s => {
    res += `id: ${s.stationId}LFName: ${s.name}LFStraße: ${s.street}LFLF`;
  });
  await sendTelegramMessage(chatId, res);
};

const listSubscriptions = async (chatId) => {
  let res = '';
  const subs = await Subscription.find({chatId: chatId});
  if (subs.length == 0) {
    await sendTelegramMessage(chatId, 'Keine vorhanden!');
  }
  subs.forEach(s => {
    res += `id: ${s.stationId}LFTyp: ${s.type}LFLF`;
  });
  await sendTelegramMessage(chatId, res);
};

const addSubscription = async (chatId, messageText) => {
  const params = messageText.replace(/\/add_sub/g, '').trim().split(' ');

  if (params.length != 2) {
    await sendTelegramMessage(chatId, 'Parameter fehlen oder inkorrekt!');
    return;
  }

  const stationId = params[0];
  const type = params[1].toLowerCase();

  const stationExists = await GasStation.exists({stationId: stationId});
  const typeExists = ['e5', 'e10', 'diesel'].includes(type);

  if (!stationExists) {
    await sendTelegramMessage(chatId, `Tankstellen mit ID: ${stationId} wurde nicht gefunden!`);
    return;
  }

  if (!typeExists) {
    await sendTelegramMessage(chatId, `Kraftstoff: ${stationId} wird nicht unterstützt!`);
    return;
  }

  if (await Subscription.exists({stationId: stationId, type: type, chatId: chatId})) {
    await sendTelegramMessage(chatId, `Abon­ne­ment: ${stationId}, ${type} existiert bereits!`);
    return;
  }

  const subscription = new Subscription({
    stationId: stationId,
    type: type,
    chatId: chatId
  });

  await subscription.save(async err => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('New Subscription persisted!');
    await sendTelegramMessage(chatId, `Erfolgreich!`);
  });
};

const removeSubscription = async (chatId, messageText) => {
  const params = messageText.replace(/\/remove_sub/g, '').trim().split(' ');

  if (params.length != 2) {
    await sendTelegramMessage(chatId, 'Parameter fehlen oder inkorrekt!');
    return;
  }

  const stationId = params[0];
  const type = params[1].toLowerCase();

  const stationExists = await GasStation.exists({stationId: stationId});
  const typeExists = ['e5', 'e10', 'diesel'].includes(type);

  if (!stationExists) {
    await sendTelegramMessage(chatId, `Tankstellen mit ID: ${stationId} wurde nicht gefunden!`);
    return;
  }

  if (!typeExists) {
    await sendTelegramMessage(chatId, `Kraftstoff: ${stationId} wird nicht unterstützt!`);
    return;
  }

  const subsExists = await Subscription.exists({stationId: stationId, type: type, chatId: chatId});

  if (!subsExists) {
    await sendTelegramMessage(chatId, `Abon­ne­ment: ${stationId}, ${type} existiert nicht!`);
    return;
  }

  await Subscription.deleteOne({stationId: stationId, type: type, chatId: chatId}).exec();

  console.log('Subscription deleted!');
  await sendTelegramMessage(chatId, `Erfolgreich!`);
};

const removeAllSubscriptions = async (chatId) => {
  await Subscription.deleteMany({chatId: chatId});
  await sendTelegramMessage(chatId, `Bye!`);
  console.log('Remove all subscriptions!');
};

const addStations = async (chatId, messageText) => {
  const stationId = messageText.replace(/\/add_station/g, '').trim();

  if (stationId == undefined || stationId.length == 0) {
    await sendTelegramMessage(chatId, 'Tankstellen ID fehlt!');
    return;
  }

  const alreadyExists = await GasStation.exists({stationId: stationId});

  if (alreadyExists) {
    await sendTelegramMessage(chatId, `Tankstellen mit ID: ${stationId} existiert bereits!`);
    return;
  }

  const url = `${baseURL}detail.php?id=${stationId}&apikey=${apiKey}`;
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

    await station.save(async err => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('New Station persisted!');
      await sendTelegramMessage(chatId, `Erfolgreich!`);
    });

  } else {
    await sendTelegramMessage(chatId, `Tankstellen mit ID: ${stationId} wurde nicht gefunden!`);
  }
};

module.exports = router;