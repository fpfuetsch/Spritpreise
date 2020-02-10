import { Markup } from 'telegraf'

export function init (bot) {

    const mainMenu = Markup.inlineKeyboard([
        Markup.callbackButton('Neue Benarchichtigung', 'sub_add_menu'),
        Markup.callbackButton('Benachrichtigung löschen', 'sub_remove_menu')
      ]).extra()

      bot.command('menu', async (ctx) => {
        ctx.reply('Hauptmenü', mainMenu)
      })

}
