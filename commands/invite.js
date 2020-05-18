module.exports = {
	name: 'invite',
    description: 'Invite this bot to a server (owner only.)',
    ownerOnly: true,
    args: false,
    execute(msg, args) {
        msg.author.send("https://discordapp.com/oauth2/authorize?client_id=701525679933489282&scope=bot&permissions=108608")
    }
};