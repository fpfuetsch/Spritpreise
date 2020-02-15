export function init (bot) {
  bot.command('help', (ctx) => ctx.replyWithHTML(
    '🛠 Dir stehen folgende Befehle zur Verfügung: ⚙\n\n' +
    '<b>/menu</b> Interaktives Menü zum Verwalten von Benachrichtigungen\n' +
    '<b>/status</b> Statusabfrage für abonnierte Tankstellen\n' +
    '<b>/stop</b> Löscht alle Benachrichigungen\n' +
    '<b>/help</b> Zeigt diese Nachricht'
  ))
}
