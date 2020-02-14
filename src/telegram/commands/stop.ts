import { Subscription } from '../../data/model'

export function init (bot) {
  bot.command('stop', async (ctx) => {
    await Subscription.deleteMany({chatId: ctx.chat.id})
    await ctx.reply('Bye! Du wirst nun keine automatisierten Nachrichten mehr erhalten. 👋')
  })
}
