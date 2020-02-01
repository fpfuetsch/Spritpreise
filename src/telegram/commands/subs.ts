import { GasStation, Subscription } from '../../data/model'

export function init (bot) {
  bot.command('subs', async (ctx) => {
    const subs = await Subscription.find({chatId: ctx.chat.id});
    if (subs.length == 0) {
      await ctx.reply('Keine vorhanden!');
    } else {
      let message = '';
      for (const s of subs) {
        const station = await GasStation.findOne({stationId: s.stationId}, {name: 1, street: 1});
        message += `ID: ${s.stationId}\nName: ${station.name}\nStraße: ${station.street}\nTyp: ${s.type}\n\n`;
      }
      await ctx.reply(message);
    }
  })
}
