import { GasStation, Subscription } from '../../data/model'

export function init (bot) {
  bot.command('remove_sub', async (ctx) => {
    const params = ctx.message.text.replace(/\/remove_sub/g, '').trim().split(' ')

    if (params.length != 2) {
      await ctx.reply('Parameter fehlen oder inkorrekt!')
      return
    }

    let stationId = params[0]
    const type = params[1].toLowerCase()

    const stationCount = await GasStation.countDocuments({stationId: new RegExp(stationId)})
    const typeExists = ['e5', 'e10', 'diesel'].includes(type)

    if (stationCount == 0) {
      await ctx.reply(`Tankstellen mit ID: ${stationId} wurde nicht gefunden!`)
      return
    }

    if (stationCount > 1) {
      await ctx.reply(`Tankstellen mit ID: ${stationId} konnte nicht eindeutig identifiziert werden!`)
      return
    }

    if (!typeExists) {
      await ctx.reply(`Kraftstoff: ${stationId} wird nicht unterstützt!`)
      return
    }

    stationId = await GasStation.findOne({stationId: new RegExp(stationId)}, {stationId: 1}).then(s => s.stationId)

    const subsExists = await Subscription.exists({stationId, type, chatId: ctx.chat.id})

    if (!subsExists) {
      await ctx.reply(`Abon­ne­ment: ${stationId}, ${type} existiert nicht!`)
      return
    }

    await Subscription.deleteOne({stationId, type, chatId: ctx.chat.id}).exec()

    console.log('Subscription deleted!')
    await ctx.reply(`Erfolgreich!`)
  })
}
