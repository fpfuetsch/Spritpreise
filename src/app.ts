import * as cors from 'cors'
import * as express from 'express'
import * as mongoose from 'mongoose'
import { configureUpdates } from './data/price-update'
import { TelegramBot } from './telegram/bot'

const DB_URL = process.env.DB_URL
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_TOKEN

const PORT = process.env.SERVER_PORT || 8080
const WEBHOOK_HOST = process.env.WEBHOOK_HOST
const WEBHOOK_PATH = `/tb-webhook-${TELEGRAM_BOT_TOKEN}`

const app = express()
const bot = TelegramBot.Instance

async function start () {
  try {
    await mongoose.connect(DB_URL)
    console.log(`Successfully connected to database`)
  } catch (error) {
    console.error(error)
  }

  app.use(cors())

  configureUpdates()

  if (WEBHOOK_HOST) {
    app.use(bot.webhookCallback(WEBHOOK_PATH))
    bot.telegram.setWebhook(`${WEBHOOK_HOST}${WEBHOOK_PATH}`)
    console.log(`Bot is using webhook for host '${WEBHOOK_HOST}!'`)
  } else {
    bot.telegram.deleteWebhook()
    bot.startPolling(30, 100)
    console.log(`Bot is using polling mode!`)
  }

  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}!`)
  })

}

start()
