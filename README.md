# Tracker Bot

Converts usernames into UUIDs using the Mojang API and records it. Generates a list of the latest usernames based on those UUIDs.

---

## Important Note

*This project was last updated in March 2022. Some packages/services such as DiscordJS or the Mojang API may have changed. To reproduce, changes may be needed. Moreover, this project is designed for Minecraft Java Edition. Using this in other games or versions of MC may not work.*

## Features

1. **Proxy Support**: Requests are sent out via proxy to mitigate API IP rate limits. 
2. **Efficient Generation**: Requests leverage async promises to reduce generation time. Custom three-level system  handles proxies, batches, and individual requests.
3. **Configurations**: Set API limits, concurrency limits, error thresholds, etc. depending on current specs of providers/systems.

## Requisites 

*All services are either free or offer freemium.*

1. [NodeJS](https://nodejs.org)
2. [Discord App](https://discord.com/developers) 
3. [Mojang API](https://wiki.vg/Mojang_API)
4. [Webshare Proxy](https://www.webshare.io/)
4. [MongoDB](https://mongodb.com/)


## Variables

*All variables, including Config variables, MUST be specified or else the system will not start at all.*

### Auth
* **MONGODB_URI** - Database URI provided by MongoDB
* **WEBSHARE_PROXY_API_KEY** - API Key provided by Webshare
* **DISCORD_TOKEN** - Application Token provided by Discord

### System
* **MONGODB_DATABASE_NAME** - Name of the MongoDB Database
* **MONGODB_COLLECTION_NAME** - Name of the Collection inside the Database
* **DISCORD_FILE_CHANNEL_ID** - Name of the Channel inside of a Discord Server for the Generated list to be sent to.
* **GENERATE_FILE_NAME** - Name of the file containing the generated list.

### Config 
* **WEBSHARE_PROXY_CONCURRENCY_LIMIT** - # of Simultaenous Requests for a each proxy (should be 50 by default)
* **MOJANG_API_LIMIT** - # of Allowed requests per IP 
* **MOJANG_API_TIMEOUT** - Time in seconds of timeout when requests are reached.
* **GENERATE_ERROR_LIMIT** - Threshold for # of allowable errors before the list generation stops.

## Setup

Run the following commands:

`npm install`

`npm start`

## Commands

`/a {player: username/uuid}` - Adds a player; can be a plain username or direct uuid.

`/d {player: username/uuid}` - Deletes a player; can be a plain username or direct uuid.

`/c` - Generates a list based on the current database.