const fs = require("fs");
const { MessageEmbed } = require("discord.js");

module.exports = {
	name: 'hotlist-all',
    description: 'Display stats of all 30 hotlist programs on 1 embed.',
    guildOnly: true,
	args: false,
	execute(msg, args) {
        let db = JSON.parse(fs.readFileSync("storage/hotlist.json", "utf8")).list;
        let description = "";
        let entry;
        let fields = [];
        for (let i = 0; i < db.length; i ++) {
            let proj = db[i];
            let deltaVotes, deltaPosition, val;

            val = parseInt(proj.diffVotes);
            if (val > 0) {
                deltaVotes = "(+"+val.toString()+")";
            } else if (val < 0) {
                deltaVotes = "("+val.toString()+")";
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

            entry = "["+proj.title.substring(0,800)+"](https://www.khanacademy.org/cs/i/"+proj.id+") : **"+proj.votes+"** "+deltaVotes+"  "+deltaPosition;

            if (i < 5) {
                let numbers = ["one", "two", "three", "four", "five"];
                description += (":"+numbers[i]+": - "+proj.authorNickname+"\n"+" "+entry+"\n\n").substring(0, 400);// In case multiple programs with long titles occupy the top 5 spots
            } else {
                fields.push({
                    'name': ((i+1).toString()+" - "+proj.authorNickname).substring(0,1024),
                    'value': entry,
                    'inline': false
                })
            }
        }
        msg.channel.send({
            embed:{
                title: "Hotlist",
                color: 0xEB406A,
                description: description+"** **",
                fields: fields
            }
        });
    }
};