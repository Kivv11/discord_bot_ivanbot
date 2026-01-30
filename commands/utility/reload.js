const { SlashCommandBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');


module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('reload')
		.setDescription('Recarga un comando.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addStringOption((option) => option.setName('command').setDescription('El comando a recargar.').setAutocomplete(true).setRequired(true)),
		async autocomplete(interaction) {
			const focusedValue = (interaction.options.getFocused()?? '').toLowerCase();
			const names = [...interaction.client.commands.keys()]
			const choices = names
			.filter(n => n.toLowerCase().includes(focusedValue.toLowerCase()))
    		.slice(0, 25)
    		.map(n => ({ name: n, value: n }));
			await interaction.respond(choices);
		},
	async execute(interaction) {
        const commandName = interaction.options.getString('command', true).toLowerCase();
		const command = interaction.client.commands.get(commandName);

		if (!command) {
			return interaction.reply(`No hay ningún comando con el nombre \`${commandName}\`!`);
		}
		
        delete require.cache[require.resolve(`./${command.data.name}.js`)];
        try {
			if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
				await interaction.reply('No tienes permiso para usar este comando.');
			} else {
			const newCommand = require(`./${command.data.name}.js`);
	        interaction.client.commands.set(newCommand.data.name, newCommand);
	        await interaction.reply(`El comando \`${newCommand.data.name}\` fue recargado!`);
			}
			
        } catch (error) {
	        console.error(error);
	        await interaction.reply(
		        `Hubo un error mientras se recargaba el comando \`${command.data.name}\`:\n\`${error.message}\``,
	        );
        }   
	}
};