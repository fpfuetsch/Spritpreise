import { Markup } from 'telegraf'
import { GasStation, Subscription } from '../../data/model'
import { persistStation } from '../../data/station-add'
import { findStationsByLocation, findStationsByText } from '../../data/station-find'

export function init (bot) {

  const MAX_STATION_COUNT = 6

  const stationMenu = Markup.inlineKeyboard([
    [
      Markup.button.callback('Liste 📄', 'list_station'),
      Markup.button.callback('Umkreis 📍', 'find_station_by_location'),
    ],
    [
      Markup.button.callback('Text 🔍', 'find_station_by_text'),
    ]
  ])

  bot.action('sub_add_menu', async (ctx) => {
    ctx.editMessageText('Tankstelle finden mit...', stationMenu)
  })

  bot.action('list_station', async (ctx) => {
    const stations = await GasStation.find({}, {stationId: 1, brand: 1, street: 1, city: 1})
    if (stations.length === 0) {
      await ctx.editMessageText('Keine vorhanden!')
    } else {
      await ctx.editMessageText('Folgende Tankstellen werden bereits getrackt', stationListMenu(stations))
    }
  })

  bot.action('find_station_by_location', async (ctx) => {
    await ctx.reply(
      'Bitte schicke mir deinen Standort, sodass ich nach Tankstellen in deiner Umgebung suchen kann.',
      Markup.keyboard([
        [Markup.button.locationRequest('Standort schicken')]
      ]).resize().oneTime()
    )
  })

  bot.action('find_station_by_text', async (ctx) => {
    ctx.session.locationRequest = true
    await ctx.reply('Bitte schicke mir einen Ort in Deutschland in dessen Umgebung ich nach Tankstellen suche soll.')
  })


  bot.on('location', async (ctx) => {
    const stations = await findStationsByLocation(ctx.message.location)
    if (stations.length === 0) {
      await ctx.reply(`Keine Tankstellen in der Umgebung gefunden! 🤷`)
    } else {
      await ctx.reply('Tankstellen in deiner Umgebung', stationListMenu(stations))
    }
  })

  bot.on('text', async (ctx) => {
    if (ctx.session.locationRequest) {
      const res = await findStationsByText(ctx.message.text)
      if (res.location === 'error') {
        await ctx.reply(`Keine Tankstellen für den Ort ${ctx.message.text}' gefunden! 🤷`)
        return
      }
      if (res.stations.length === 0) {
        await ctx.reply(`Keine Tankstellen in der Umgebung von '${res.location}' gefunden! 🤷`)
      } else {
        await ctx.reply(`Tankstellen in der Umgebung von '${res.location}'`, stationListMenu(res.stations))
      }
    }
  })

  bot.action(new RegExp('scb_\S*'), async (ctx) => {
    const stationId = ctx.update.callback_query.data.split('_')[1]
    const gasTypeMenu = Markup.inlineKeyboard(
      [
        [
          Markup.button.callback('Super', `sfcb_${stationId}_e5`),
          Markup.button.callback('E10', `sfcb_${stationId}_e10`),
          Markup.button.callback('Diesel', `sfcb_${stationId}_diesel`)
        ]
      ]
    )
    await ctx.editMessageText('Kraftstoff auswählen', gasTypeMenu)
  })

  bot.action(new RegExp('sfcb_\S*'), async (ctx) => {
    const stationId = ctx.update.callback_query.data.split('_')[1]
    const type = ctx.update.callback_query.data.split('_')[2]

    if (await Subscription.exists({stationId, type, chatId: ctx.chat.id})) {
      await ctx.editMessageText(`Abon­ne­ment existiert bereits! 👌`)
      return
    }

    // track station if it isn't tracked already
    await persistStation(stationId)

    const subscription = new Subscription({
      stationId,
      type,
      chatId: ctx.chat.id,
      active: true
    })

    await subscription.save()
    await ctx.editMessageText(`Neues Abonnement wurde erfolgreich erstellt! ✅`)
  })

  function stationListMenu(stations) {
    const buttons = []
    for (let i = 0; i < Math.min(stations.length, MAX_STATION_COUNT); i++) {
      const station = stations[i]
      buttons.push([Markup.button.callback(`${station.brand} ${station.street} ${station.place || station.city}`, `scb_${station.stationId || station.id}`)])
    }
    return Markup.inlineKeyboard(buttons)
  }
}
