import * as dotenv from 'dotenv'
dotenv.config()

import Telegraf, { Context, session } from 'telegraf'

import * as help from './commands/help'
import * as menu from './commands/menu'
import * as start from './commands/start'
import * as status from './commands/status'
import * as stop from './commands/stop'
import * as sub_add from './commands/sub-add'
import * as sub_remove from './commands/sub-remove'

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN

export class TelegramBot {

  private static botInstance: Telegraf<Context>

  private static commands = [
    help,
    menu,
    start,
    status,
    stop,
    sub_add,
    sub_remove,
  ]

  private constructor() {}

  public static get Instance() {
    if (this.botInstance) {
      return this.botInstance
    } else {
      this.botInstance = new Telegraf(TELEGRAM_TOKEN)
      this.botInstance.use(session())
      this.commands.forEach(c => c.init(this.botInstance))
      return this.botInstance
    }
  }
}
