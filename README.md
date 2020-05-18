# Khan Academy Hotlist Tracker

(unfinished)
One Paragraph of project description goes here

## Running Locally

### Prerequisites

* [Node.js installed](https://nodejs.org/en/)
* [Discord](https://discordapp.com/) - Free chat platform to view data
* [Discord bot](https://discordapp.com/developers/applications/)
You will also need to install the following node modules: `discord.js`, `node-schedule`, and `node-fetch`

### Setting up

1. Clone the project locally. 

2. Create a Discord bot with basic permissions (A permissions integer of 116800 works) and invite it to a Discord server.

3. Locate the config.json file and put the appropriate values for the following:
- token: The Discord bot's token string
- owner: Your Discord ID (e.g. "505927834460487698")
- prefix: Bot prefix (e.g. ";")

Save this file before proceeding.

4. Font (?)

4. Open a terminal at the project's location and type
```
$ npm init
```

5. Install neccessary node modules
Open a terminal at the project's location and type the following commands:
```
$ npm i discord.js
$ npm i node-schedule
$ npm i node-fetch
$ npm i canvas
```


### Running

When running for the first time, run these scripts **in this order**
```
$ node periodic.js
$ node bot.js
```

### How to end

The code can be safely killed and reloaded by terminating both scripts. You can also kill the `bot.js` script by typing `.stop` on Discord.

## Questions?

DM me on Discord (`Squishy#2348`) or join my bot server: https://discord.gg/M6eCAFH 