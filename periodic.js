// Imports
const fs = require("fs");
const fetch = require("node-fetch");
const schedule = require("node-schedule");
const csvWriter = require("csv-write-stream");

var trackingDb;

function requestHotlist() {
  fetch(
    "https://www.khanacademy.org/api/internal/scratchpads/top?casing=camel&sort=3&page=1&limit=30&subject=all&topic_id=xffde7c31",
    {
      headers: {},
      method: "GET",
      mode: "cors",
    }
  )
    .then((response) => response.json())
    .then((data) => {
      addHotlistEntry(data);
    })
    .catch((err) => console.log(err));
}

function addHotlistEntry(data) {
  let votes = 0;
  let spinoffs = 0;
  let votesGrowth = 0;
  let spinoffGrowth = 0;
  let projectsInfo = [];

  let projects = data.scratchpads;
  for (let i = 0; i < projects.length; i++) {
    pro = projects[i];
    votes += pro.sumVotesIncremented;
    spinoffs += pro.spinoffCount;
    projectsInfo.push({
      title: pro.title,
      id: pro.url.slice(pro.url.length - 16),
      authorNickname: pro.authorNickname,
      votes: pro.sumVotesIncremented,
      spinoffs: pro.spinoffCount,
    });
  }

  // Create storage dir if it doesn't exist
  if (!fs.existsSync("storage")) fs.mkdirSync("storage");

  // Update hotlist.json
  let fileName = "./storage/hotlist.json";
  let db;
  if (fs.existsSync(fileName)) {
    db = JSON.parse(fs.readFileSync(fileName, "utf8")).list;
  } else {
    db = {
      list: [],
    };
  }
  for (let i = 0; i < projectsInfo.length; i++) {
    const newItem = projectsInfo[i];

    let matched = false;
    for (let j = 0; j < db.length; j++) {
      let oldItem = db[j];
      if (oldItem.id === newItem.id) {
        matched = true;
        votesGrowth += newItem.votes - oldItem.votes;
        spinoffGrowth += newItem.spinoffs - oldItem.spinoffs
        newItem.diffVotes = newItem.votes - oldItem.votes;
        newItem.diffPosition = j - i;
        break;
      }
    }
    if (!matched) {
      // New rising program on hotlist
      newItem.diffVotes = null;
      newItem.diffPosition = null;
    }
  }
  db = { list: projectsInfo };
  fs.writeFileSync(fileName, JSON.stringify(db));

  // Update data.csv
  fileName = "./storage/hotlist.csv";
  let writer = csvWriter({ sendHeaders: false });
  writer.pipe(fs.createWriteStream(fileName, { flags: "a" }));
  writer.write({
    header1: new Date().getTime(),
    header2: votes,
    header3: spinoffs,
    header4: votesGrowth,
    header5: spinoffGrowth
  });
  writer.end();

  // Log message
  console.log("Wrote to hotlist.json", new Date().getTime(), votes, spinoffs);
}

function requestProject(pro) {
  fetch("https://www.khanacademy.org/api/labs/scratchpads/" + pro.id, {
    headers: {},
    method: "GET",
    mode: "cors",
  })
    .then((response) => response.json())
    .then(function (data) {

      ///TODO
      if (pro.noActivityCycles === undefined) {
        pro.noActivityCycles = 0;// backwards-compatible
      }

      let lastHistoryItem = pro.history[pro.history.length - 1];
      if (data.sumVotesIncremented === lastHistoryItem.votes && data.spinoffCount === lastHistoryItem.spinoffs) {
        pro.noActivityCycles++;
        if (pro.noActivityCycles >= 6 * 24) {// There are 6*24 10-minute periods in a day (hotlist update cycles)
          pro.alive = false;
          console.log(`Program arhived. ID: ${pro.id}. EasyID: ${pro.easyId}`);
        }
      }

      // Add main data
      pro.history.push({
        votes: data.sumVotesIncremented,
        spinoffs: data.spinoffCount,
        date: new Date().getTime(),
      });

      fs.writeFileSync(
        "./storage/tracking.json",
        JSON.stringify(trackingDb),
        "utf8"
      );

      ///trackingDb.projects[index].noActivityCycles = 
    })
    .catch((err) => console.log(err));
}

var j = schedule.scheduleJob("01,11,21,31,41,51 * * * *", function () {
  // Run at 6:01, 6:11, 6:21, 6:31, etc...
  requestHotlist();

  // Check if tracking file exists, then loop through and update each project
  if (!fs.existsSync("./storage")) fs.mkdirSync("./storage");
  if (!fs.existsSync("./storage/tracking.json")) {
    trackingDb = { projects: [], easyNum: 100 };
  } else {
    trackingDb = JSON.parse(fs.readFileSync("./storage/tracking.json", "utf8"));
  }
  trackingDb.projects.forEach((pro, index) => {
    if (pro.alive) requestProject(pro);
  });

  console.log(`Updated`, new Date().getTime());
});
console.log("Started");