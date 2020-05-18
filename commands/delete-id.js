const fs = require("fs");

module.exports = {
  name: "delete-id",
  cooldown: 30 * 60,
  description: "Deletes a project from the tracking file.",
  ownerOnly: true,
  aliases: ["delete", "del", "d"],
	usage: '[easy-id]',
  args: true,
  execute(msg, args) {
    let id = parseInt(args[0]);
    db = JSON.parse(fs.readFileSync("./storage/tracking.json", "utf8"));
    for (let i = 0; i < db.projects.length; i++) {
      const proj = db.projects[i];
      if (proj.id === id || proj.easyId === id) {
        db.projects.splice(i, 1);
        fs.writeFileSync("./storage/tracking.json", JSON.stringify(db), "utf8");
        return msg.channel.send(
          `Successfully deleted project \`${id}\` from the projects list.`
        );
      }
    }
    msg.channel.send("ID not found in tracking.json");
  },
};
