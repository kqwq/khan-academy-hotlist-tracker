const fs = require("fs");
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "hotlist",
  description: "Display stats of 5 projects at a time, with options to scroll through the hotlist row-by-row by reacting (⬆️, ⬇️, ⏫).",
  aliases: ["hot", "h"],
  guildOnly: true,
  args: false,
  execute(msg, args) {
    let db = JSON.parse(fs.readFileSync("storage/hotlist.json", "utf8")).list;
    let page = 0;

    const generateEmbed = (page) => {
      let fields = [];
      for (let i = page * 5; i < (page + 1) * 5; i++) {
        let proj = db[i];
        let deltaVotes, deltaPosition, val;

        val = parseInt(proj.diffVotes);
        if (val > 0) {
          deltaVotes = "(+" + val.toString() + ")";
        } else if (val < 0) {
          deltaVotes = "(" + val.toString() + ")";
        } else if (val === 0) {
          deltaVotes = "";
        } else {
          deltaVotes = "";
        }

        val = parseInt(proj.diffPosition);
        if (val > 0) {
          deltaPosition = ":small_red_triangle:".repeat(val);
        } else if (val < 0) {
          deltaPosition = ":small_red_triangle_down:".repeat(-val);
        } else if (val === 0) {
          deltaPosition = "";
        } else {
          deltaPosition = ":new:";
        }

        fields.push({
          name: ((i + 1).toString() + " - " + proj.authorNickname).substring(
            0,
            1024
          ),
          value:
            "[" +
            proj.title.substring(0, 800) +
            "](https://www.khanacademy.org/cs/i/" +
            proj.id +
            ") : **" +
            proj.votes +
            "** " +
            deltaVotes +
            "  " +
            deltaPosition,
          inline: false,
        });
      }
      let embed = {
        embed: {
          title: "Hotlist",
          color: 0xeb406a,
          fields: fields,
        },
      };
      return embed;
    };

    const filter = (reaction, user) => {
      return ["⬆️", "⬇️", "⏫"].includes(reaction.emoji.name) && !user.bot;
    };

    const handleReactions = function (botMsg) {
      if (page === 0) {
        botMsg.react("⬇️");
      } else if (page === 1) {
        botMsg.react("⬆️").then(() => botMsg.react("⬇️"));
      } else if (page === 5) {
        botMsg.react("⬆️").then(() => botMsg.react("⏫"));
      } else {
        botMsg.react("⬆️").then(() => botMsg.react("⬇️").then(() => botMsg.react("⏫")));
      }

      botMsg
        .awaitReactions(filter, { max: 1, time: 60000, errors: ["time"] })
        .then((collected) => {
          const reaction = collected.first();
          botMsg.reactions
            .removeAll()
            .catch((error) =>
              console.error("Failed to clear reactions: ", error)
            );
          switch (reaction.emoji.name) {
            case "⬆️":
                page = Math.max(0, page - 1);
              break;

            case "⬇️":
                page = Math.min(5, page + 1);
              break;

            case "⏫":
              page = 0;
              break;

            default:
              console.log("Wrong emoji");
              break;
          }
          botMsg
            .edit(generateEmbed(page))
            .then(handleReactions)
            .catch(console.error);
          
        })
        .catch(console.error);///TODO does this call when awaitReactions ends?
    };

    msg.channel
      .send(generateEmbed(page))
      .then(handleReactions)
      .catch(console.error);
  },
};
