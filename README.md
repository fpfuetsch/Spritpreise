# Telegram Spritpreis Bot

Telegram bot that notifies about relevant price changes of subscribed gas stations using the Tankerkönig API.

<b>Currently only the German language is supported.<b>

# Environment Variables

* API_KEY - API Token for Tankerkoenig
* DB_URL - Mongo database URL
* SERVER_PORT - Server port
* API_BASE_PATH - API base path
* TELEGRAM_TOKEN - Telegram bot token
* UPDATE_CYCLE - Minutes until prices are updated
* SEARCH_RADIUS - Search radius in km for gas stations

# Deployment

## Telegram

Set up the telegram webhook to receive updates as described [here](https://core.telegram.org/bots/api#setwebhook).
It needs to point to the endpoint `{API_BASE_PATH}/telegram/updates/{TELEGRAM_TOKEN}`.

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