const { Keyv } = require('keyv');
const keyv = new Keyv('sqlite://./data/reminders.sqlite');
const { DateTime } = require('luxon');
const { MUDAE_CHANNEL_ID, STAFF_ROLE_ID, MIEMBROS_ROLE_ID } = require('../config.json');
const { PermissionsBitField, ChannelType } = require('discord.js');

let isScheduled = false;

keyv.on('error', (err) => console.error('Keyv connection error:', err));

const getNextOneAM = () => {
    const now = DateTime.now().setZone('America/Montevideo');
    let nextOneAM = now.set({ hour: 2, minute: 0, second: 0, millisecond: 0 });
    const tNow = now.toMillis();
    const tTarget = nextOneAM.toMillis();
    if (tTarget <= tNow) {
        nextOneAM = nextOneAM.plus({ days: 1 });
    }
    return nextOneAM;
}; 


const scheduleDailyReminders = (client) => {
    if (isScheduled) return;
    const target = getNextOneAM();
    const now = DateTime.now().setZone('America/Montevideo');
    let delayMs = Math.max(0, target.diff(now).toMillis());
    const handler = async () => {
        const today = DateTime.now().setZone('America/Montevideo')
        const dateKey = today.toFormat('yyyy-LL-dd');
        const dailyKey = `daily:` + dateKey;
        let channel;
        try {
            const value = await keyv.get(dailyKey);
            if (value) {
                console.log(`Ya está marcado hoy.`);
            } else {
                channel = await client.channels.fetch(MUDAE_CHANNEL_ID);
                    if (!channel || channel.type !== ChannelType.GuildText) {
                        throw new Error('Canal no encontrado o no es de texto.');
                    }
                    const role = await channel.guild.roles.fetch(MIEMBROS_ROLE_ID);
                    if (!role) {
                        throw new Error('Rol "Miembros" no encontrado.');
                    }
                    await channel.permissionOverwrites.edit(role, { SendMessages: false });
                    const canSend = channel.permissionsFor(role)?.has(PermissionsBitField.Flags.SendMessages);
                    if (canSend) {
                        throw new Error('No se pudo negar SendMessages al rol.');
                    }
                    // MENSAJE DE ÉXITO
                    await channel.send({
                    content: `<#${MUDAE_CHANNEL_ID}> Fue cerrado exitosamente[.](https://i.imgur.com/sdU677G.gif) <@&${STAFF_ROLE_ID}>`,
                    allowedMentions: { roles: [STAFF_ROLE_ID] }
                    });

                await keyv.set(dailyKey, { ranAt: today.toISO() });
                const log = await keyv.get('daily:log') || [];
                log.push(dateKey);
                await keyv.set('daily:log', log);
            };
        } catch (error) {
            if (channel) {
                // MENSAJE DE ERROR
                await channel.send({
                content: `No se pudo cerrar el canal[.](https://i.imgur.com/9mhMyXZ.jpeg) <@&${STAFF_ROLE_ID}>`,
                allowedMentions: { roles: [STAFF_ROLE_ID] }
            });
            }
            console.error('Error handling daily reminder:', error);
        } finally {
            const next2 = getNextOneAM();
            const now2 = DateTime.now().setZone('America/Montevideo');
            const delay2 = Math.max(0, next2.diff(now2).toMillis());
            setTimeout(handler, delay2);
        }
    }
    console.log('Agendado para:', target.setLocale('es').toFormat('yyyy-LL-dd HH:mm:ss ZZZZ'));
    setTimeout(handler, delayMs);
    isScheduled = true;
};

module.exports = { scheduleDailyReminders };