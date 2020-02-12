import { Alert, AlertLevel, GasStation, Subscription } from '../../data/model'
import { TelegramBot } from '../bot'
import { getReadableGasType } from '../../utils'

export async function notifyAboutAlerts(alters: Alert[]) {
  const bot = TelegramBot.Instance
  const subsciptions = await Subscription.find().exec()
  subsciptions.forEach(async s => {
    const matches = alters.filter(a => a.stationId === s.stationId && a.type === s.type)
    if (matches.length > 0) {
      await bot.telegram.sendMessage(s.chatId, await generateAlertText(matches, s.stationId, s.type), {parse_mode: 'HTML'})
    }
  })
}

async function generateAlertText (alerts: Alert[], stationId: number, type: string) {
  const station = await GasStation.findOne({stationId}, {name: 1, street: 1}).exec()
  let text = `Benachrichtigung für ${station.name} ${station.street}, Krafstoff: ${getReadableGasType(type)}.\n`
  alerts.forEach(a => {
    if (a.level === AlertLevel.STANDARD) {
      text += `\nNeues Minimum für Zeitraum: ${a.days} Tag(e)\nVorheriges Minimum: <b>${a.lastPrice}€</b>\nNeues Minimum: <b>${a.newPrice}€</b>\n`
    } else if (a.level === AlertLevel.REPEAT) {
      text += `\nMinimum der letzten 24h von <b>${a.lastPrice}€</b> wurde erneut erreicht!\n`
    }
  })
  return text
}
