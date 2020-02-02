import { persistStation, Response } from '../../data/station-add'

export function init (bot) {
  bot.command('add_station', async (ctx) => {
    const stationId = ctx.message.text.replace(/\/add_station/g, '').trim()

    if (stationId === undefined || stationId.length === 0) {
      await ctx.reply('Tankstellen ID fehlt!')
      return
    }

    const response: Response = await persistStation(stationId)

    switch (response) {
      case Response.CONFLICT:
        await ctx.reply(`Tankstellen mit ID: ${stationId} existiert bereits!`)
        break
      case Response.DONE:
        await ctx.reply(`Erfolgreich!`)
        break
      case Response.NOT_FOUND:
        await ctx.reply(`Tankstellen mit ID: ${stationId} wurde nicht gefunden!`)
        break
    }
  })
}
