import { GasStation, Subscription } from '../../data/model'

export function init (bot) {
  bot.command('status', async (ctx) => {
    const subscriptions = await Subscription.find({chatId: ctx.chat.id}).exec()
    let message = ''
    if (subscriptions.length == 0) {
      message += 'Keine Abonnements!'
    } else {
      for (const s of subscriptions) {
        message += await generateStatusText(s.stationId, s.type);
      }
    }
    await ctx.replyWithHTML(message)
  })
}

async function generateStatusText(stationId: Number, type: String) {
  const station = await GasStation.findOne({stationId}).exec()
  let message = `\nStatus für ${station.name} ${station.street}, Krafstoff: ${type.toUpperCase()}.\n`;

  const latestSnapshot = station[type].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))[0];
  const minutesAgo: String = ((Date.now() - Date.parse(latestSnapshot.timestamp)) / (60 * 1000)).toFixed(0);
  message += `\nLetzter Preis: <b>${latestSnapshot.price}€</b> (vor ${minutesAgo}min)\n`

  message += `Minimum / Durchschnitt\n`;
  message += `24h: <b>${station.stats[type].lowest[1]}€</b> / <b>${station.stats[type].average[1]}€</b>\n`;
  message += `3d: <b>${station.stats[type].lowest[3]}€</b> / <b>${station.stats[type].average[3]}€</b>\n`;
  message += `7d: <b>${station.stats[type].lowest[7]}€</b> / <b>${station.stats[type].average[7]}€</b>\n`;
  message += `30d: <b>${station.stats[type].lowest[30]}€</b> / <b>${station.stats[type].average[30]}€</b>\n`;
  return message;
}