import { Markup } from 'telegraf'
import { Subscription } from '../../data/model'

export function init (bot) {

  const basicMainMenu = [
    Markup.callbackButton('Erstellen 🌟', 'sub_add_menu'),
    Markup.callbackButton('Löschen ❌', 'sub_remove_menu')
  ]

  bot.command('menu', async (ctx) => {
    const menu = await mainMenu(ctx)
    ctx.reply(menu.message, menu.keyboard)
  })

  bot.action(new RegExp('subpp_\S*'), async (ctx) => {
    const active = ctx.update.callback_query.data.split('_')[1] === 'play'
    const subs = await Subscription.find({chatId: ctx.chat.id, active: !active}).exec()

    for (const sub of subs) {
      sub.active = active
      await sub.save()
    }
    const menu = await mainMenu(ctx)
    ctx.editMessageText(menu.message, menu.keyboard)
  })

  async function mainMenu(ctx) {
    const subs = await Subscription.find({chatId: ctx.chat.id})
    const notificationsActive = subs.filter(sub => sub.active === true).length > 0
    const mainMenuButtons = [
      [ ...basicMainMenu ],
      subs.length > 0 ?
        [ notificationsActive ? Markup.callbackButton('Pausieren ⏸', `subpp_pause`) :
                                Markup.callbackButton('Fortsetzen ▶', `subpp_play`) ]
      : []
    ]
    return {
             message: 'Was kann ich für dich tun? Du kannst Benachrichtigungen...',
             keyboard: Markup.inlineKeyboard(mainMenuButtons).extra()
           }
  }

}
