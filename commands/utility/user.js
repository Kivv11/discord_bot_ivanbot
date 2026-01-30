const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder().setName('user').setDescription('Da información sobre el usuario.'),
	async execute(interaction) {
		// interaction.user is the object representing the User who ran the command
		// interaction.member is the GuildMember object, which represents the user in the specific guild
		await interaction.reply(
			`Este comando fue ejecutado por ${interaction.user.username}, quien se unió el ${interaction.member.joinedAt}.`,
		);
	},
};