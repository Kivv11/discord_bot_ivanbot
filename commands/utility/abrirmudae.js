const { SlashCommandBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord.js');
const { MUDAE_CHANNEL_ID, STAFF_ROLE_ID, MIEMBROS_ROLE_ID } = require('../../config.json');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('abrirmudae')
        .setDescription('Abre el canal de Mudae en el servidor.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
        try {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels)) {
                await interaction.reply('No tienes permiso para usar este comando.');
            } else {
                const channel = await interaction.guild.channels.fetch(MUDAE_CHANNEL_ID);
                if (!channel) {
                    await interaction.reply({content: 'No se encontró el canal de Mudae.', ephemeral: true});
                }
                const role = await channel.guild.roles.fetch(MIEMBROS_ROLE_ID);
                if (!role) {
                    await interaction.reply({content: 'No se encontró el rol de Miembros.', ephemeral: true});
                }
                await channel.permissionOverwrites.edit(role, {
                    SendMessages: true});
                await interaction.reply({content: 'Canal de Mudae abierto correctamente.', ephemeral: true});
                await channel.send({
                content: `<#${MUDAE_CHANNEL_ID}> Fue abierto exitosamente[.](https://i.imgur.com/zTlKM4V.gif) <@&${STAFF_ROLE_ID}>`,
                allowedMentions: { roles: [STAFF_ROLE_ID] }
                });
            }
        } catch (error) {
            console.error(error);
            await interaction.reply(
                `Hubo un error al abrir el canal de Mudae:\n\`${error.message}\` <@&${STAFF_ROLE_ID}>`,
            );
        }
    }
};