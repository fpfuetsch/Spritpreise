import * as dotenv from 'dotenv'
dotenv.config()

import Telegraf from 'telegraf'

import * as start from './commands/start'
import * as stations from './commands/stations'
import * as status from './commands/status'
import * as stop from './commands/stop'
import * as subs from './commands/subs'
import * as add_sub from './commands/add_sub'
import * as remove_sub from './commands/remove_sub'
import * as add_station from './commands/add_station'
import * as find_station from './commands/find_station'

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN

export class TelegramBot {

  private static bot_instance

  private static commands = [
    start,
    stations,
    status,
    stop,
    subs,
    add_sub,
    remove_sub,
    add_station,
    find_station
  ]

  private constructor() {}

  public static get Instance() {
    if (this.bot_instance) {
      return this.bot_instance
    } else {
      this.bot_instance = new Telegraf(TELEGRAM_TOKEN)
      this.commands.forEach(c => c.init(this.bot_instance))
      return this.bot_instance
    }
  }
}