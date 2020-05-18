const fs = require("fs");
const parse = require("csv-parse");
const { prefix } = require("../config.json");
const generateGraph = require("../util/generateGraph.js")

module.exports = {
  name: "votes",
  description:
    "Shows the vote and spin-off growth history of the top 30 programs found here: https://www.khanacademy.org/cs/i/browse. This chart does not account for projects that have recently moved in or out of the top 30 positions, but does account for negative change in votes and spinoffs within the top 30.",
  guildOnly: true,
  aliases: ["v"],
  usage: '{hours}',
  args: false,
  execute(msg, args) {
    let times, votes, spinoffs;
    times = [];
    votes = [];
    spinoffs = [];

    // Time since
    var hours;
    if (args[0] === undefined) {
      hours = 24;
    } else {
      if (args[0] === "[hours]") {
        return msg.channel.send(
          `Replace \`[hours]\` with a number.\nExample usage: ${prefix}graph hotlist 24`
        );
      }
      hours = parseInt(args[0]);
      if (hours === undefined) {
        return msg.channel.send(
          `Argument 1 should be a number, not ${args[1]}!`
        );
      }
    }
    var firstTime = new Date().getTime() - hours * 60 * 60 * 1000;

    fs.createReadStream("./storage/hotlist.csv")
      .pipe(parse({ delimiter: "," }))
      .on("data", function (csvrow) {
        csvrow = csvrow.map(Number);
        if (csvrow[0] < firstTime || csvrow[3] === -1) { // If happened before firstTime, ignore
          return;
        }

        times.push(csvrow[0]);
        votes.push(csvrow[3]);
        spinoffs.push(csvrow[4]);

      })
      .on("end", function () {
        let timesHour, votesHour, spinoffsHour, sumVotes, sumSpinoffs;
        timesHour = [];
        votesHour = [];
        spinoffsHour = [];
        sumVotes = 0;
        sumSpinoffs = 0;
        for (let i = 0; i < times.length; i++) {
          sumVotes += votes[i];
          sumSpinoffs += spinoffsHour[i];
          minutes = new Date(times[i]).getMinutes();
          if (minutes % 10 >= 0 && minutes <= 2) {
            timesHour.push(times[i]);
            votesHour.push(votes[i]);
            spinoffsHour.push(spinoffs[i]);
            sumVotes = 0;
            sumSpinoffs = 0;
          }
        }

        generateGraph.execute(
          msg,
          `Hotlist (votes per hour)`,
          "Top 30 / Accumlative - [Browse](https://www.khanacademy.org/cs/browse)",
          firstTime,
          timesHour,
          votesHour,
          null,
          "orange",
        );
      });


  },
};
