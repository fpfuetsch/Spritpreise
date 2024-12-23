import { GasStation, Subscription } from '../../data/model'
import { getReadableGasType } from '../../utils'

export function init(bot) {
  bot.command('status', async (ctx) => {
    const subscriptions = await Subscription.find({ chatId: ctx.chat.id }).exec()
    let message = ''
    if (subscriptions.length === 0) {
      message += 'Keine Abonnements!'
    } else {
      let statusTexts = []
      for (const s of subscriptions) {
        statusTexts.push(await generateStatusText(s.stationId, s.type))
      }
      message = statusTexts.join('\n\n')
    }
    await ctx.replyWithMarkdown(message)
  })
}

async function generateStatusText(stationId: string, type: string) {
  const station = await GasStation.findOne({ stationId }).exec()
  let message = `👉 ${station.name} ${station.street}\n`
  message += `💧 ${getReadableGasType(type)}\n`

  const latestSnapshot = station[type][0]
  if (latestSnapshot) {
    const minutesAgo: string = ((Date.now() - Date.parse(latestSnapshot.timestamp)) / (60 * 1000)).toFixed(0)
    message += `💰 ${latestSnapshot.price}€ (vor ${minutesAgo} min)\n`

    message += '\n```'
    message += '      |  Min.  | Durch. |\n'
    message += '+-----+--------+--------+\n'
    message += `| 24h | ${station.stats[type].lowest[1].toFixed(3)}€ | ${station.stats[type].average[1].toFixed(3)}€ |\n`
    message += `| 3d  | ${station.stats[type].lowest[3].toFixed(3)}€ | ${station.stats[type].average[3].toFixed(3)}€ |\n`
    message += `| 7d  | ${station.stats[type].lowest[7].toFixed(3)}€ | ${station.stats[type].average[7].toFixed(3)}€ |\n`
    message += `| 30d | ${station.stats[type].lowest[30].toFixed(3)}€ | ${station.stats[type].average[30].toFixed(3)}€ |\n`
    message += '```'
  } else {
    message += '🥺 Keine Daten verfügbar.'
  }
  return message
}
