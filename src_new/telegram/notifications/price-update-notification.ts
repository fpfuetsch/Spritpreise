import { TelegramBot } from '../bot'
import { Alert, Subscription, GasStation, AlertLevel } from '../../data/model';

export async function notifyAboutAlerts(alters: Alert[]) {
  const bot = TelegramBot.Instance;
  const subsciptions = await Subscription.find().exec();
  subsciptions.forEach(async s => {
    const matches = alters.filter(a => a.stationId == s.stationId && a.type == s.type);
    if (matches.length > 0) {
      await bot.telegram.sendMessage(s.chatId, await generateAlertText(matches, s.stationId, s.type), {parse_mode: 'HTML'});
    }
  });
}

async function generateAlertText (alerts, stationId, type) {
  const station = await GasStation.findOne({stationId}, {name: 1, street: 1}).exec();
  let text = `Benachrichtigung für ${station.name} ${station.street}, Krafstoff: ${type.toUpperCase()}.\n`;
  alerts.forEach(a => {
    if (a.level == AlertLevel.STANDARD) {
      text += `\nNeues Minimum für Zeitraum: ${a.days} Tag(e)\n`;
      text += `Vorheriges Minimum: <b>${a.lastLowest}€</b>\n`;
      text += `Neues Minimum: <b>${a.newLowest}€</b>\n`;
    } else if (a.level == AlertLevel.REPEAT) {
      text += `\nMinimum der letzten 24h von <b>${a.lastLowest}€</b> wurde erneut erreicht!\n`;
    }
  });
  return text;
};
