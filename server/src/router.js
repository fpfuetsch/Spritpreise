const express = require('express');
const router = express.Router();

const chatBegin = require('./telegram/actions').chatBegin;
const chatEnd = require('./telegram/actions').chatEnd;
const status = require('./telegram/actions').status;
const listStations = require('./telegram/actions').listStations;
const addStations = require('./telegram/actions').addStations;
const listSubscriptions = require('./telegram/actions').listSubscriptions;
const addSubscription = require('./telegram/actions').addSubscription;
const removeSubscription = require('./telegram/actions').removeSubscription;
const unknownCommand = require('./telegram/actions').unknownCommand;

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_TOKEN;

router.post('/telegram/updates/:token', async (req, res) => {
  const message = req.body.message;
  const token = req.params.token;

  if (token != TELEGRAM_BOT_TOKEN) {
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
    await chatBegin(chat.id);
  } else if (message.text.startsWith('/stop')) {
    await chatEnd(chat.id);
  } else if (message.text.startsWith('/status')) {
    await status(chat.id);
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
  } else {
    await unknownCommand(chat.id);
  }
  res.send();
});

module.exports = router;