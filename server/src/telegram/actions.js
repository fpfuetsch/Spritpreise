
const GasStation = require('../model').GasStation;
const Subscription = require('../model').Subscription;
const sendTelegramMessage = require('./notifier').sendTelegramMessage;
const notifyStatus = require('./notifier').notifyStatus;
const persistStation = require('../data/update').persistStation;

const unknownCommand = async (chatId) => {
  await sendTelegramMessage(chatId, 'Das verstehe ich nicht!');
};

const chatBegin = async (chatId) => {
  await sendTelegramMessage(chatId, 'Seid gegrüßt!');
};

const chatEnd = async (chatId) => {
  await Subscription.deleteMany({chatId: chatId});
  await sendTelegramMessage(chatId, `Bye!`);
  console.log('Remove all subscriptions!');
};

const status = async (chatId) => {
  await notifyStatus(chatId);
};

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

const addStations = async (chatId, messageText) => {
  const stationId = messageText.replace(/\/add_station/g, '').trim();

  if (stationId == undefined || stationId.length == 0) {
    await sendTelegramMessage(chatId, 'Tankstellen ID fehlt!');
    return;
  }

  switch (await persistStation(stationId)) {
  case 'conflict':
    await sendTelegramMessage(chatId, `Tankstellen mit ID: ${stationId} existiert bereits!`);
    break;
  case 'error':
    await sendTelegramMessage(chatId, `Es ist ein Fehler aufgetreten!`);
    break;
  case 'done':
    await sendTelegramMessage(chatId, `Erfolgreich!`);
    break;
  case 'not found':
    await sendTelegramMessage(chatId, `Tankstellen mit ID: ${stationId} wurde nicht gefunden!`);
    break;
  }
};

module.exports.chatBegin = chatBegin;
module.exports.chatEnd = chatEnd;
module.exports.status = status;
module.exports.listStations = listStations;
module.exports.listSubscriptions = listSubscriptions;
module.exports.addSubscription = addSubscription;
module.exports.listSubscriptions = listSubscriptions;
module.exports.removeSubscription = removeSubscription;
module.exports.addStations = addStations;
module.exports.unknownCommand = unknownCommand;