const fs = require("fs");
const parse = require("csv-parse");
const { owner, prefix } = require("../config.json");
const generateGraph = require("../util/generateGraph.js")

module.exports = {
  name: "graph",
  description:
    "Shows the vote and spin-off history of the top 30 programs found here: https://www.khanacademy.org/cs/i/browse",
  guildOnly: true,
  aliases: ["g"],
	usage: '["hotlist" | "h" | easy-id] {hours}',
  args: true,
  execute(msg, args) {
    let times, votes, spinoffs;
    times = [];
    votes = [];
    spinoffs = [];

    // Time since
    var hours;
    if (args[1] === undefined) {
      hours = 24;
    } else {
      if (args[1] === "[hours]") {
        return msg.channel.send(
          `Replace \`[hours]\` with a number.\nExample usage: ${prefix}graph hotlist 24`
        );
      }
      hours = parseInt(args[1]);
      if (hours === undefined) {
        return msg.channel.send(
          `Argument 2 should be a number, not ${args[1]}!`
        );
      }
      if (hours <= 0) {
        return msg.channel.send(`Argument 2 should be a positive number, not ${args[1]}!`)
      }
      if (hours > 720) {
        return msg.channel.send(`Cannot display vote history starting longer than a month (720 hours) ago. DM <@${owner}> if you're interested in hotlist data older than 1 month.`)
      }
    }
    var firstTime = new Date().getTime() - hours * 60 * 60 * 1000;

    if (args[0] === "hotlist" || args[0] === "hot" || args[0] === "h") {
      fs.createReadStream("./storage/hotlist.csv") ///TODO loop backwards
        .pipe(parse({ delimiter: "," }))
        .on("data", function (csvrow) {
          csvrow = csvrow.map(Number);
          if (csvrow[0] < firstTime) {
            // If happened before firstTime, ignore
            return;
          }
          if (hours > 48) {// If large time range, show only hourly data
            minutes = new Date(csvrow[0]).getMinutes();
            if (minutes % 10 >= 0 && minutes <= 2) {
              times.push(csvrow[0]);
              votes.push(csvrow[1]);
              spinoffs.push(csvrow[2]);
            }
          } else {
            times.push(csvrow[0]);
            votes.push(csvrow[1]);
            spinoffs.push(csvrow[2]);
          }
        })
        .on("end", function () {
          generateGraph.execute(
            msg,
            `Hotlist`,
            "Top 30 / Accumulative - [Browse](https://www.khanacademy.org/cs/browse)",
            firstTime,
            times,
            votes,
            spinoffs,
            "red",
            "cyan"
          );
        });
    } else {
      let id = args[0];
      if (id.length !== 3 && id.length !== 10 && id.length !== 16) {
        return msg.channel.send(
          "Invalid program ID - must be either 10 or 16 numbers"
        );
      }
      id = parseInt(id);
      if (id === null) {
        return msg.channel.send(
          "Invalid program ID - cannot " +
          args[0].toString() +
          " is not a number"
        );
      }
      var trackingDb = JSON.parse(
        fs.readFileSync("./storage/tracking.json", "utf8")
      );
      let match = trackingDb.projects.find(
        (x) => x.id === id || x.easyId === id
      );
      if (match === undefined) {
        if (id < 1000) {
          return msg.channel.send(
            `This project currently does not exist - type ${prefix}projects for a list of projects that are being tracked`
          );
        } else {
          return msg.channel.send(
            `I'm currently not tracking this project - add this project with ${prefix}track-id ${id}`
          );
        }
      }


      for (var i = 0; i < match.history.length; i++) {
        var mhi = match.history[i];
        if (mhi.date < firstTime) { // If happened before firstTime, ignore
          continue;
        }
        times.push(mhi.date);
        votes.push(mhi.votes);
        spinoffs.push(mhi.spinoffs);
      }
      const capitalize = (s => s[0].toUpperCase() + s.slice(1));
      generateGraph.execute(
        msg,
        `${match.title}`,
        `[${capitalize(match.projectType)} project](https://www.khanacademy.org/cs/i/${match.id}) by [${match.nickname}](http://khanacademy.org/profile/${match.username})`,
        firstTime,
        times,
        votes,
        spinoffs,
        "red",
        "cyan"
      );
    }
  },
};
