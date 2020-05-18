module.exports = {
  name: "stop",
  description: "Shuts down the bot.",
  aliases: ["shutdown"],
  ownerOnly: true,
  args: false,
  execute(msg, args) {
    msg.channel
      .send("Logging off...")
      .then((msg) => msg.client.destroy())
      .catch((err) => console.log(err));
  },
};
