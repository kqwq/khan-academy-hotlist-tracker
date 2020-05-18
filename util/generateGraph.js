const { createCanvas, registerFont } = require("canvas");
registerFont("./fonts/ARIAL.TTF", { family: "Comic Sans" });
const { MessageEmbed, MessageAttachment } = require("discord.js");

module.exports = {
  execute(msg, title, description, firstTime, times, votes, spinoffs, color1, color2) {
    let yAxisPerVotes = 1;
    const marginTopBottom = 15;

    let lastTime;
    let maxVotes = Math.max.apply(Math, votes);
    let minVotes = Math.min.apply(Math, votes);
    if (minVotes === maxVotes) maxVotes += 1;
    if (maxVotes - minVotes > 30) yAxisPerVotes *= 10;
    if (maxVotes - minVotes > 300) yAxisPerVotes *= 10;
    let maxSpinoffs = Math.max.apply(Math, spinoffs);
    let minSpinoffs = Math.min.apply(Math, spinoffs);
    if (minSpinoffs === maxSpinoffs) maxSpinoffs += 1;
    const scale = (num, in_min, in_max, out_min, out_max) => {
      return (
        ((num - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
      );
    };
    lastTime = times[times.length - 1];
    doubleYAxisScale = (maxSpinoffs - minSpinoffs) / (maxVotes - minVotes);

    // Canvas setup
    const canvas = createCanvas(600, 400);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 1;
    ctx.font = '12px "Comic Sans"';
    ctx.textBaseline = "middle";

    // Y-axis gridlines (vericals at UTC midnight)
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#3b3b3b";
    let secondsPerDay = 24 * 60 * 60 * 1000;
    let startI = Math.ceil(firstTime / secondsPerDay) * secondsPerDay;
    for (let t = startI; t < lastTime; t += secondsPerDay) {
      ctx.beginPath();
      let x = scale(t, firstTime, lastTime, 40, canvas.width - 40);
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // X-axis gridlines (horizontal)
    ctx.lineWidth = 1;
    ctx.fillStyle = "white";
    ctx.strokeStyle = "gray";
    startI = Math.floor(minVotes / yAxisPerVotes - 1) * yAxisPerVotes;
    for (let i = startI; i < maxVotes + yAxisPerVotes; i += yAxisPerVotes) {
      ctx.beginPath();
      let y = scale(
        i,
        minVotes,
        maxVotes,
        canvas.height - marginTopBottom,
        marginTopBottom
      );
      ctx.moveTo(40, y);
      ctx.lineTo(canvas.width - 40, y);
      ctx.stroke();
      ctx.fillText(i, 5, y);
      if (spinoffs !== null) {
        ctx.fillText(
          Math.round(minSpinoffs + (i - startI) * doubleYAxisScale),
          canvas.width - 35,
          y
        );
      }
    }

    function lineGraph(yPosKey, lineWidth, color) {
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = color;
      ctx.beginPath();
      for (let i = 0; i < times.length; i++) {
        let posX = scale(times[i], firstTime, lastTime, 40, canvas.width - 40);
        let posY = scale(
          yPosKey(i),
          minVotes,
          maxVotes,
          canvas.height - marginTopBottom,
          marginTopBottom
        );
        ctx.lineTo(posX, posY);
      }
      ctx.stroke();
    }

    function barGraph(yPosKey) {
      function drawBar(x, y, w, h) {
        ctx.fillRect(x, y, w, h);
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.stroke();
      }

      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgb(255, 127, 0)";
      ctx.fillStyle = "rgba(255, 127, 0, 0.4)";
      let width = (canvas.width - 80) / times.length;
      for (let i = 0; i < times.length; i ++) {
        let posX = scale(times[i], firstTime, lastTime, 40, canvas.width - 40 - width);
        let posY = scale(
          yPosKey(i),
          minVotes,
          maxVotes,
          canvas.height - marginTopBottom,
          marginTopBottom
        );
        drawBar(posX, posY, width, canvas.height - marginTopBottom - posY);
      }

    }

    if (spinoffs === null) {// If viewing votes only, create a bar chart
      // If specified range includes times older than first vote data entry OR over 120 data entries (5 days)
      if (Math.abs(firstTime - times[0]) > 1000*60*60 || times.length > 240) {
        // Display as line chart instead of bar chart
        lineGraph(function (i) { return votes[i]; }, 2, color1); // Votes
      } else {
        barGraph(function (i) { return votes[i]; }); // Votes
      }
    } else {
      lineGraph(function (i) { return minVotes + (spinoffs[i] - minSpinoffs) / doubleYAxisScale; }, 1, color2); // Spinoffs
      lineGraph(function (i) { return votes[i]; }, 2, color1); // Votes
    }

    // Create graph span info for description
    let graphSpanInfo;
    let diffHours = Math.round(new Date().getTime() - firstTime) / 3600 / 1000;
    let displayDays = Math.floor(diffHours / 24);
    let displayHours = Math.floor(diffHours % 24);
    if (displayDays === 0) {
      graphSpanInfo = "";
    } else if (displayDays === 1) {
      graphSpanInfo = "1 Day and ";
    } else {
      graphSpanInfo = `${displayDays} Days and `;
    }
    if (displayHours === 1) {
      graphSpanInfo += "1 Hour";
    } else {
      graphSpanInfo += `${displayHours} Hours`;
    }

    let colorLegend = `${votes[votes.length - 1]} Votes (${color1})`;
    if (spinoffs !== null && color2 !== undefined) {
      colorLegend += ` ⋅ ${spinoffs[spinoffs.length - 1]} Spin-offs (${color2})`
    }


    const attachment = new MessageAttachment(canvas.toBuffer(), "graph.png");
    const embed = new MessageEmbed({
      title: title,
      color: 0xeb406a,
      description:
        "__" +
        graphSpanInfo +
        "__\n" +
        description +
        "\n" +
        colorLegend
    })
      .setImage("attachment://graph.png")
      .setTimestamp();
    msg.channel
      .send({ embed: embed, files: [attachment] })
      .catch(console.error);
  }
}