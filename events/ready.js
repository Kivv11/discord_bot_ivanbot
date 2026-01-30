const { Events } = require('discord.js');
const { scheduleDailyReminders } = require('../tasks/dailyReminder');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Listos! Loggeado como ${client.user.tag}`);
		client.user.setPresence({ activities: [{ name: 'ꜱᴏ ʙʟᴀᴄᴋ~... ʙʟᴀᴄᴋ ᴀꜱ ɪᴛ ᴄᴀɴ ʙᴇ~...', type: 0 }] });
		scheduleDailyReminders(client);
	},
};