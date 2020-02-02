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

# Commands

* `/start` - Sends greetings
* `/stop` - Removes all subscriptions
* `/stations` - Lists all tracked gas stations
* `/add_station {station_id}` - Adds gas station to tracking
* `/add_sub {station_id} {gas_type}` - Adds subscription for a specific gas station and a gas type (e5, e10, diesel)
* `/remove_sub {station_id} {gas_type}`- Removes subscription for a specific gas station and a gas type (e5, e10, diesel)
* `/subs` - Lists all subscriptions
* `/status` - Sends status message for all subscriptions
* If you send your location to the bot, it will respond with a list of gas stations within a radius of SEARCH_RADIUS km