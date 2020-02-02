import * as dotenv from 'dotenv'
dotenv.config()

import Telegraf from 'telegraf'

import * as add_station from './commands/add_station'
import * as add_sub from './commands/add_sub'
import * as find_station from './commands/find_station'
import * as remove_sub from './commands/remove_sub'
import * as start from './commands/start'
import * as stations from './commands/stations'
import * as status from './commands/status'
import * as stop from './commands/stop'
import * as subs from './commands/subs'

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN

export class TelegramBot {

  private static botInstance

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
    if (this.botInstance) {
      return this.botInstance
    } else {
      this.botInstance = new Telegraf(TELEGRAM_TOKEN)
      this.commands.forEach(c => c.init(this.botInstance))
      return this.botInstance
    }
  }
}
