import { Markup } from 'telegraf'
import { Subscription } from '../../data/model'

export function init (bot) {

  const basicMainMenu = [
    Markup.callbackButton('Neue Benachrichtigung', 'sub_add_menu'),
    Markup.callbackButton('Benachrichtigung löschen', 'sub_remove_menu')
  ]

  bot.command('menu', async (ctx) => {
    ctx.reply('Hauptmenü', await mainMenu(ctx))
  })

  bot.action(new RegExp('subpp_\S*'), async (ctx) => {
    const play = ctx.update.callback_query.data.split('_')[1] === 'play'
    const subs = await Subscription.find({chatId: ctx.chat.id, active: !play}).exec()

    for (const sub of subs) {
      sub.active = play
      await sub.save()
    }

    ctx.editMessageText('Hautpmenü', await mainMenu(ctx))
  })

  async function mainMenu(ctx) {
    const notificationsActive = await Subscription.exists({chatId: ctx.chat.id, active: true})
    let mainMenuButtons = []
    if (notificationsActive) {
      mainMenuButtons = [[...basicMainMenu], [Markup.callbackButton('Benachrichtigungen Pausieren ⏸', `subpp_pause`)]]
    } else {
      mainMenuButtons = [[...basicMainMenu], [Markup.callbackButton('Benachrichtigungen Fortsetzen ▶', `subpp_play`)]]
    }
    return Markup.inlineKeyboard(mainMenuButtons).extra()
  }

}
