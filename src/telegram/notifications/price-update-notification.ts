import { Alert, AlertLevel, GasStation, Subscription } from '../../data/model'
import { getReadableGasType } from '../../utils'
import { TelegramBot } from '../bot'
import * as TelegramError from 'telegraf/core/network/error'

export async function notifyAboutAlerts(alerts: Alert[]) {
  const bot = TelegramBot.Instance
  const subsciptions = await Subscription.find({active: true}).exec()
  subsciptions.forEach(async s => {
    const matches = alerts.filter(a => a.stationId === s.stationId && a.type === s.type)
    if (matches.length > 0) {
        await bot.telegram
          .sendMessage(s.chatId, await generateAlertText(matches, s.stationId, s.type), {parse_mode: 'HTML'})
          .catch(async error => {
            if (error instanceof TelegramError) {
              if (error.code == 403 && error.description.includes("blocked")) {
                console.log(`Bot was blocked by user: ${s.chatId}`)
                await Subscription.deleteMany({chatId: s.chatId})
                console.log("... subscriptions deleted!")
              }
            } else {
              console.log(error.message)
            }
          })
    }
  })
}

async function generateAlertText (alerts: Alert[], stationId: number, type: string) {
  const station = await GasStation.findOne({stationId}, {name: 1, street: 1}).exec()
  let text = `🚨 ${station.name} ${station.street}\n`
  text += `💧 ${getReadableGasType(type)}\n\n`
  alerts.forEach(a => {
    if (a.level === AlertLevel.STANDARD) {
      text += `🚀 ${a.days} Tag(e) Minimum von <b>${a.newPrice}€</b> erreicht\n`
    } else if (a.level === AlertLevel.REPEAT) {
      text += `⏱ Minimum der letzten 24h von <b>${a.lastPrice}€</b> erneut erreicht\n`
    }
  })
  return text
}
