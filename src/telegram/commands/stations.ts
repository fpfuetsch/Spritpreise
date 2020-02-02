import { GasStation } from '../../data/model'

export function init (bot) {
  bot.command('stations', async (ctx) => {
    const stations = await GasStation.find({}, {stationId: 1, name: 1, street: 1})
    if (stations.length === 0) {
      await ctx.reply('Keine vorhanden!')
    } else {
      let message = 'Folgende Tankstellen werden bereits getrackt:\n\n'
      stations.forEach(station => {
        message += `Name: ${station.name}\nStraße: ${station.street}\n\n`
      })
      await ctx.reply(message)
    }
  })
}
