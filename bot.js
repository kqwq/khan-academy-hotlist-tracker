// Imports
const fs = require("fs");
const Discord = require("discord.js");
const { prefix, token, owner } = require("./config.json");

// Functions
function readData() {
  if (fs.existsSync("storage/hotlist.json")) {
    return JSON.parse(fs.readFileSync("hotlist_data.json", "utf8"));
  } else {
    return {
      history: [],
      current: [],
      trackingIds: [
        // 6296110573961216, ...
      ],
      projects: {
        /*
{
  id: 6296110573961216,
  title: MINECRAFT - DEMO,
  kaid: ...,
  authorName: xacer, 
  created: [Date],
  history: {
    {
      date: [Date],
      votes: 64,
      spinoffs: 22
    },
    {
      data: [Date],
      votes: 66,
      spinoffs: 22
    }
  }
},
{
  ...
}

*/
      },
    };
  }
}

// Setup
const client = new Discord.Client();

// File setup
if (!fs.existsSync("./storage")) fs.mkdirSync("./storage");
if (!fs.existsSync("./storage/tracking.json")) {
  fs.writeFileSync(
    "./storage/tracking.json",
    JSON.stringify({ projects: [], easyNum: 100 }),
    "utf8"
  );
}

// Command/cooldown setup
client.commands = new Discord.Collection();
const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}
const cooldowns = new Discord.Collection();

client.on("ready", () => {
  client.user.setActivity(`${prefix}help`);
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", (message) => {
  // Command / args handling
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  if (message.channel.type !== "text") return; // Bot does NOT support DMs
  const args = message.content.slice(prefix.length).split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command =
    client.commands.get(commandName) ||
    client.commands.find(
      (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
    );
  if (!command) return;
  if (command.ownerOnly && message.author.id.toString() !== owner.toString()) {
    console.log(message.author.id, owner);
    return message.reply("this command is reserved for the owner to use!");
  }
  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`;
    if (command.usage) {
      reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
    }
    return message.channel.send(reply);
  }

  // Cooldown
  if (message.author.id.toString() !== owner.toString()) {
    // The owner is not subject to cooldowns
    if (!cooldowns.has(command.name)) {
      cooldowns.set(command.name, new Discord.Collection());
    }
    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;
    if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return message.reply(
          `please wait ${timeLeft.toFixed(
            1
          )} more second(s) before reusing the \`${command.name}\` command.`
        );
      }
    }
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
  }

  // Execute command
  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    console.log(`${message.author.tag} ran the command ${commandName}`);
    message.reply("there was an error trying to execute that command.");
  }
});

client.login(token);
