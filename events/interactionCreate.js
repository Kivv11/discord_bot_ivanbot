const { Events, MessageFlags, Collection } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isAutocomplete()) {
			const command = interaction.client.commands.get(interaction.commandName);
			try {
				if (command?.autocomplete) {
					await command.autocomplete(interaction);
				} else {
					await interaction.respond([]);
				}
			} catch (error) {
				console.error(error);
				try {
					await interaction.respond([]);
				} catch {}
			}
			return;
		}
		if (!interaction.isChatInputCommand()) return
		const command = interaction.client.commands.get(interaction.commandName);
		if (!command) {
			console.error(`Ningún comando con la palabra: "${interaction.commandName}" fue encontrado.`);
			return;
		}
		// Manejo de cooldowns
        const { client } = interaction;
        const { cooldowns } = interaction.client;

        if (!cooldowns.has(command.data.name)) {
	        cooldowns.set(command.data.name, new Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.data.name);
        const defaultCooldownDuration = 3;
        const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1_000;

        if (timestamps.has(interaction.user.id)) {
            const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
            if (now < expirationTime) {
                const expiredTimestamp = Math.round(expirationTime / 1_000);
                return interaction.reply({
                    content: `Alto ahí!. Podrás volver a usar este comando en: <t:${expiredTimestamp}:R>.`,
                    flags: MessageFlags.Ephemeral,
                });
            }
        }
        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
		// Manejo de interacciones de comandos
		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({
					content: 'Hubo un error mientras se ejecutaba este comando!',
					flags: MessageFlags.Ephemeral,
				});
			} else {
				await interaction.reply({
					content: 'Hubo un error mientras se ejecutaba este comando!',
					flags: MessageFlags.Ephemeral,
				});
			}
		}
	},
};
