import { findStations } from '../../data/station-find'

export function init (bot) {
  bot.on('location', async (ctx) => {
    const stations = await findStations(ctx.message.location)
    if (stations.length == 0) {
      await ctx.reply(`Keine Tankstellen in der Umgebung gefunden!`)
    } else {
      let message = `Tankstellen in der Umgebung:\n\n`
      for (const s of stations) {
        message += `ID: ${s.id}\nName: ${s.name}\nStraße: ${s.street}\n\n`
      }
      await ctx.reply(message)
    }
  })
}
