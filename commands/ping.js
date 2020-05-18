module.exports = {
  name: "ping",
  cooldown: 1,
  description: "Shows bot latency in milliseconds",
  args: false,
  execute(msg, args) {
    msg.channel
      .send("Pinging...")
      .then((m) => {
        let ping = m.createdTimestamp - msg.createdTimestamp;
        m.edit(`Bot latency: ${ping}`);
      })
      .catch((err) => console.log(err));
  }
};
