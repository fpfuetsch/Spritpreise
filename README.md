# Telegram Spritpreis Bot

Telegram bot that notifies about relevant price changes of subscribed gas stations using the Tankerkönig API.

<b>Currently only the German language is supported.<b>

# Environment Variables

* API_KEY - API Token for Tankerkoenig
* DB_URL - Mongo database URL
* SERVER_PORT - Server port
* WEBHOOK_HOST - URL of webhook host (e.g. https://example.org)
* TELEGRAM_TOKEN - Telegram bot token
* UPDATE_CYCLE - Minutes until prices are updated
* SEARCH_RADIUS - Search radius in km for gas stations

# Deployment

## Telegram

If the `WEBHOOK_HOST` is set, the bot runs in webhook mode. Otherwise polling mode is activated.

## Development

`$ npm run dev`

## Docker-Compose

First set the environment variables in the compose file.

`$ docker-compose up`