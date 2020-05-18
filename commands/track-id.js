const fs = require("fs");
const fetch = require("node-fetch");
const { prefix, owner } = require("../config.json");

module.exports = {
  name: "track-id",
  cooldown: 30 * 60,
  description: "Adds a project to the tracking list. This can be a PJS, HTML, or SQL project. The project is automatically is archived if it doesn't recieve any votes or spinoffs in a 24 hours span.",
  guildOnly: true,
  aliases: ["track", "t"],
  usage: '[hotlist-position | project-id]',
  args: true,
  execute(msg, args) {
    let id = args[0];
    if (id.length >= 3 && id.length !== 10 && id.length !== 16) {
      return msg.channel.send(
        "Invalid project ID - must be one of the following:\n1. The program's position on the hotlist (0-30)\n2. A 10 or 16-digit ID found in the URL of the project's page"
      );
    }
    id = parseInt(id);
    if (id === null) {
      return msg.channel.send(
        "Invalid project ID - " + args[0].toString() + " is not a number"
      );
    }
    id = id.toString();

    var db;

    function handleProjectData(projectData) {
      function handleUserData(userData) {
        let entry = {
          alive: true,
          id: projectData.id, // id as a string
          easyId: db.easyNum,
          title: projectData.title,
          kaid: projectData.kaid,
          username: userData.username,
          nickname: userData.nickname,
          projectType: (projectData.userAuthoredContentType === "pjs") ? "PJS" : projectData.userAuthoredContentType,
          created: new Date(projectData.created),
          noActivityCycles: 0, // For automatic archiving 
          history: [
            {
              // When created
              date: new Date(projectData.created).getTime(),
              votes: 1,
              spinoffs: 0
            },
            {
              // Now
              date: new Date().getTime(),
              votes: projectData.sumVotesIncremented,
              spinoffs: projectData.spinoffCount
            },
          ],
        };
        db.projects.push(entry);
        db.easyNum++;// For Discord users to graph program without having to type 16 numbers

        // Write
        fs.writeFileSync("./storage/tracking.json", JSON.stringify(db), "utf8");

        return msg.channel.send(`Successfullly added ${projectData.title} by ${userData.nickname} to the list.\nType \`${prefix}graph ${entry.easyId}\` [hours] to see its vote history at any time.`)
      }


      fetch(
        "https://www.khanacademy.org/api/internal/user/profile?kaid=" + projectData.kaid,
        {
          headers: {},
          method: "GET",
          mode: "cors",
        }
      )
        .then((response) => response.json())
        .then((data) => {
          handleUserData(data);
        })
        .catch((err) => console.log(err));
    }



    // Convert ID to 10/16 digit if a ID based off the ;hotlist was added
    if (id.length < 3) {
      id = parseInt(id);
      id -= 1;//// id-1 because the displayed values are (1-30) while the actual indexes are (0-29)
      hotlistDb = JSON.parse(fs.readFileSync("./storage/hotlist.json", "utf8")).list;
      if (id > hotlistDb.length || id < 0) {
        return msg.channel.send(`Project out of range - choose an ID from 1 to ${hotlistDb.length + 1} from \`${prefix}hotlist\` or use the project's 16-digit ID`);
      }
      id = hotlistDb[id].id;
    }

    // Check if project is already in tracking database
    db = JSON.parse(fs.readFileSync("./storage/tracking.json", "utf8"));
    if (db.projects.some(x => x.id === id)) {
      if (db.projects[id].isAlive) {
        return msg.channel.send(`Already tracking this project - type ${prefix}graph ${id} instead`);
      } else {
        return msg.channel.send(`This project has already been tracked previously and is currently archived.\nOnly the developer can view this project's vote history.`);
      }
    }

    // Fetch project (chain-fetching because scratchpads does NOT return the author's nickname or username)
    fetch("https://www.khanacademy.org/api/labs/scratchpads/" + id, {
      headers: {},
      method: "GET",
      mode: "cors",
    })
      .then((response) => response.json())
      .then(
        data => {
          handleProjectData(data);
        },
        err => {
          msg.channel.send(`Failed to grab a project with an ID of ${id}.\nCheck if this project exists at https://www.khanacademy.org/cs/i/${id} first.\nIf you think this is a mistake, DM <@${owner}>.`);
        }
      )
      .catch((err) => function () { console.log(err); msg.channel.send("test"); });
  },
};


