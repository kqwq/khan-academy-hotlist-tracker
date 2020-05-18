const { prefix } = require('../config.json');
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: 'help',
  description: 'List all of my commands or info about a specific command.',
  aliases: ['commands'],
  usage: '{command name}',
  args: false,
  execute(msg, args) {
    const { commands } = msg.client;

    if (!args.length) {
      let helpStr = 'Here\'s a list of all my commands:\n\n• ';
      let userCommands = commands.filter(command => command.ownerOnly !== true);
      helpStr += userCommands.map(command => `\`${command.name}\` ` + (command.usage ? (command.usage) : "")).join('\n• ');
      helpStr += `\n\n**Format**\n\`command-name\` [required-argument] {optional-argument} {option-1 | option-2} {"literal text"}\n\n**Legend**\n`;
      helpStr += `• *easy-id* - 3-digit project ID shown by the projects list (\`${prefix}projects\`)\n`;
      helpStr += `• *hours* - Duration in hours (default is 24)\n`;
      helpStr += `• *hotlist-position* - Current position on the hotlist shown by the command \`${prefix}hotlist\`\n`;
      helpStr += `• *project-id* - 10 or 16 digit project ID found in the URL of the project's page on Khan Academy\n`;
      helpStr += `You can send \`${prefix}help\` {command name} to get info on a specific command.`;
      let embed = new MessageEmbed({
        title: "Commands",
        description: helpStr,
        color: 0xEB406A
      });
      return msg.channel.send(embed);
    }

    const name = args[0].toLowerCase();
    const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

    if (!command) {
      return msg.channel.send('That\'s not a valid command!');
    }

    let embed = new MessageEmbed({
      title: `Command: ${command.name}`,
      color: 0xEB406A
    });

    if (command.description) embed.setDescription(command.description);
    if (command.aliases) embed.addField(`**Aliases**`, `${command.aliases.join(', ')}`);
    if (command.usage) embed.addField(`**Usage**`, `${prefix}${command.name} ${command.usage}`);
    if (command.ownerOnly) {
      embed.addField(`**Public**`, "No");
    } else {
      embed.addField(`**Public**`, "Yes");
    }
    if (command.cooldown) {
      embed.addField(`**Cooldown**`, `${command.cooldown} second(s)`);
    } else {
      embed.addField(`**Cooldown**`, `None`);
    }

    msg.channel.send(embed);
  },
};