const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder().setName('server').setDescription('Da información sobre el server.'),
	async execute(interaction) {
		// interaction.guild is the object representing the Guild in which the command was run
		await interaction.reply(
			`Este server se llama ${interaction.guild.name} y tiene ${interaction.guild.memberCount} miembros.`,
		);
	},
};