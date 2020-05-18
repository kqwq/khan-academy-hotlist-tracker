const fs = require("fs");

module.exports = {
  name: "archive-manual",
  cooldown: 30 * 60,
  description: "Manually stop tracking a project and archive its stats (projects are automatically archived after not receiving a vote in any 24-hour span)",
  ownerOnly: true,
  aliases: ["archive"],
  usage: ["easy-id"],
  args: true,
  execute(msg, args) {
    let id = parseInt(args[0]);
    db = JSON.parse(fs.readFileSync("./storage/tracking.json", "utf8"));
    for (let i = 0; i < db.projects.length; i++) {
      const proj = db.projects[i];
      if (proj.id === id || proj.easyId === id) {
        db.projects[i].alive = false;
        fs.writeFileSync("./storage/tracking.json", JSON.stringify(db), "utf8");
        return msg.channel.send(
          `Successfully archived project \`${id}\`.`
        );
      }
    }
    msg.channel.send("ID not found in tracking.json");
  },
};
