import { Markup, Extra } from 'telegraf'
import { GasStation, Subscription } from '../../data/model'
import { persistStation } from '../../data/station-add'
import { findStationsByLocation } from '../../data/station-find'

export function init (bot) {

  const MAX_STATION_COUNT = 6

  const stationMenu = Markup.inlineKeyboard([
    Markup.callbackButton('Auflisten', 'list_station'),
    Markup.callbackButton('Umkreissuche', 'find_station')
  ]).extra()

  bot.command('station', async (ctx) => {
    ctx.reply('Tankstellen', stationMenu)
  })

  bot.action('list_station', async (ctx) => {
    const stations = await GasStation.find({}, {stationId: 1, brand: 1, street: 1})
    if (stations.length === 0) {
      await ctx.editMessageText('Keine vorhanden!')
    } else {
      const buttons = []
      for (const station of stations) {
        buttons.push([Markup.callbackButton(`${station.brand} ${station.street}`, `scb_${station.stationId}`)])
      }
      const stationsFoundMenu = Markup.inlineKeyboard(buttons).extra()
      await ctx.editMessageText('Folgende Tankstellen werden bereits getrackt', stationsFoundMenu)
    }
  })

  bot.action('find_station', async (ctx) => {
      await ctx.reply('Bitte schicke mir deinen Standort, sodass ich nach Tankstellen in deiner Umgebung suchen kann.', Extra.markup((markup) => {
        return markup.resize()
          .keyboard([
            markup.locationRequestButton('Standort schicken')
          ])
      }))
  })

  bot.on('location', async (ctx) => {
    const stations = await findStationsByLocation(ctx.message.location)
    if (stations.length === 0) {
      await ctx.reply(`Keine Tankstellen in der Umgebung gefunden!`)
    } else {
      const buttons = []
      for (let i = 0; i < Math.min(stations.length, MAX_STATION_COUNT); i++) {
        const station = stations[i]
        buttons.push([Markup.callbackButton(`${station.brand} ${station.street}`, `scb_${station.id}`)])
      }
      const stationsFoundMenu = Markup.inlineKeyboard(buttons).extra()
      await ctx.reply('Tankstellen in deiner Umgebung', stationsFoundMenu)
    }
  })

  bot.action(new RegExp('scb_\S*'), (ctx) => {
    const stationId = ctx.update.callback_query.data.split('_')[1]
    const gasTypeMenu = Markup.inlineKeyboard([
      [Markup.callbackButton('Super', `sfcb_${stationId}_e5`)],
      [Markup.callbackButton('E10', `sfcb_${stationId}_e10`)],
      [Markup.callbackButton('Diesel', `sfcb_${stationId}_diesel`)]
    ]).extra()
    ctx.editMessageText('Kraftstoff auswählen', gasTypeMenu)
  })

  bot.action(new RegExp('sfcb_\S*'), async (ctx) => {
    const stationId = ctx.update.callback_query.data.split('_')[1]
    const type = ctx.update.callback_query.data.split('_')[2]

    if (await Subscription.exists({stationId, type, chatId: ctx.chat.id})) {
      await ctx.editMessageText(`Abon­ne­ment existiert bereits!`)
      return
    }

    // track station if it isn't tracked already
    await persistStation(stationId)

    const subscription = new Subscription({
      stationId,
      type,
      chatId: ctx.chat.id
    })

    await subscription.save()
    await ctx.editMessageText(`Neues Abonnement wurde erfolgreich erstellt!`)
  })
}
