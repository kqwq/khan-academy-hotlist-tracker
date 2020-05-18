const fs = require("fs");
const { MessageEmbed } = require("discord.js");
const { prefix } = require("../config.json");

module.exports = {
  name: "projects",
  description: "Show a list of projects that are currently being tracked, sorted by `easy-id`.",
  aliases: ["pro", "p"],
  guildOnly: true,
  args: false,
  execute(msg, args) {
    // Create storage dir if it doesn't exist

    let db = JSON.parse(fs.readFileSync("./storage/tracking.json")).projects;
    if (db.length === 0) {
      msg.channel.send(
        `I'm not currently tracking any projects. Type ${prefix}help track-id for more info`
      );
    }

    let embed = new MessageEmbed({
      title: "Tracking Projects",
      color: 0xEB406A,
      description: `Type \`${prefix}graph [ID]\` to see the vote history of the following projects`,
    });
    for (let i = 0; i < db.length; i++) {
      let x = db[i];
      lastTimeEntry = x.history[x.history.length - 1];///TODO remove if unneccessary
      let aliveSymbol = x.alive ? ":ballot_box_with_check:" : ":no_entry_sign:";
      embed.addField(
        `${x.easyId} ${aliveSymbol}`,
        `[${x.title}](https://khanacademy.org/cs/i/${x.id}) by [${x.nickname}](https://khanacademy.org/profile/${x.username})`
      );
    }

    return msg.channel.send(embed);
  },
};
