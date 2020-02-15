import { Markup } from 'telegraf'
import { Subscription } from '../../data/model'

export function init (bot) {

  const basicMainMenu = [
    Markup.callbackButton('Erstellen 🌟', 'sub_add_menu'),
    Markup.callbackButton('Löschen ❌', 'sub_remove_menu')
  ]

  bot.command('menu', async (ctx) => {
    await mainMenu(ctx)
  })

  bot.action(new RegExp('subpp_\S*'), async (ctx) => {
    const active = ctx.update.callback_query.data.split('_')[1] === 'play'
    const subs = await Subscription.find({chatId: ctx.chat.id, active: !active}).exec()

    for (const sub of subs) {
      sub.active = active
      await sub.save()
    }

    await mainMenu(ctx)
  })

  async function mainMenu(ctx) {
    const notificationsActive = await Subscription.exists({chatId: ctx.chat.id, active: true})
    const mainMenuButtons = [
      [ ...basicMainMenu ],
      [ notificationsActive ? Markup.callbackButton('Pausieren ⏸', `subpp_pause`) :
                              Markup.callbackButton('Fortsetzen ▶', `subpp_play`) ]
    ]
    ctx.editMessageText('Was kann ich für dich tun? Du kannst Benachrichtigungen...', Markup.inlineKeyboard(mainMenuButtons).extra())
  }

}
