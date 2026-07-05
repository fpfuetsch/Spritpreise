# Telegram Spritpreis Bot

Telegram bot that tracks gas station prices and notifies users about relevant price changes.
It uses the Tankerkonig API for fuel data and MongoDB for persistence.

Note: The bot currently supports German only.

## Features

- Subscribe to gas stations and fuel types
- Get regular updates about price changes
- Query stations by text or location
- Pause and resume notifications

## Requirements

- Node.js (LTS recommended)
- npm
- MongoDB
- Telegram bot token
- Tankerkonig API key

## Environment Variables

Create a .env file and set the following values:

- API_KEY: Tankerkonig API key
- DB_URL: MongoDB connection string
- SERVER_PORT: Port for the HTTP server (default: 8080)
- WEBHOOK_HOST: Public HTTPS host for Telegram webhook mode (optional)
- TELEGRAM_TOKEN: Telegram bot token
- UPDATE_CYCLE: Price update interval in minutes
- CLEANUP_CYCLE: Cleanup minute within each hour for old snapshots
- SEARCH_RADIUS: Search radius in km for nearby stations

If WEBHOOK_HOST is set, the bot uses webhook mode. If not, it uses polling mode.

## Local Development

1. Install dependencies:

	npm install

2. Create environment files:

- Copy .env_template to .env and fill in values
- Copy .env-db_template to .env-db and fill in values

3. Start in development mode:

	npm run dev

## Docker Compose

1. Prepare config files:

- Copy mongo-init.js_template to mongo-init.js and set MongoDB credentials
- Copy .env_template to .env and fill in values
- Copy .env-db_template to .env-db and fill in values

2. Build and start containers:

	docker compose up --build -d

3. Stop containers:

	docker compose down

## MongoDB Major Upgrade (Docker Compose)

If you run with persisted data in `./data`, upgrade MongoDB major versions step by step.
Do not skip major versions. Always upgrade `N -> N+1`.

Example path:

1. 6.x -> 7.x
2. 7.x -> 8.x

### 1) Prepare and back up

1. Stop app writes during migration:

	docker compose stop spritpreise

2. Create a backup archive from the running DB:

	docker compose exec db sh -lc 'mongodump --username "$MONGO_INITDB_ROOT_USERNAME" --password "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin --archive=/tmp/pre-upgrade.archive --gzip'
	docker compose cp db:/tmp/pre-upgrade.archive ./pre-upgrade.archive.gz

### 2) Upgrade one major step (`N -> N+1`)

1. In `docker-compose.yml`, change the DB image from your current major to the next major:

	image: mongo:N.0

to:

	image: mongo:N+1.0

2. Restart DB and verify startup logs:

	docker compose up -d db
	docker compose logs --tail=100 db

3. Set Feature Compatibility Version (FCV) to the same target major:

	docker compose exec db sh -lc 'mongosh --username "$MONGO_INITDB_ROOT_USERNAME" --password "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin --eval "db.adminCommand({ setFeatureCompatibilityVersion: \"N+1.0\" })"'

4. Run quick checks (application logs, bot actions, write operations).

5. Repeat this section until you reach the desired major version.

### 3) Restart app and validate

	docker compose up -d spritpreise
	docker compose logs --tail=100 spritpreise

## Project Structure

- src/data: Data access, models, station search, and update logic
- src/telegram: Bot setup, commands, and notifications
- src/app.ts: Application entry point
- docker-compose.yml: App and MongoDB services
- Dockerfile: Multi-stage container build

## Scripts

- npm run dev: Start development mode with nodemon
- npm run build: Build production bundle with webpack

## Notes

- For production, prefer webhook mode with HTTPS.
