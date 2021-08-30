// check for dj role or manage channels permission
function checkForPermissions(member) {
  return member.roles.cache.some(role => role.name.toLowerCase() === 'dj' || member.permissions.has('MANAGE_CHANNELS'));
}

module.exports = (interaction, queue, botCommand = false) => {
  return new Promise((resolve, reject) => {
    if (!interaction.inGuild() && botCommand) return;
    if (!interaction.inGuild()) reject({content: 'Music commands are only available in a guild'});
    const channel = interaction.member?.voice.channel;
    
    // if video is requested by bot and user isnt in a voice channel/has no permission, dont send a message
    if ((!channel && botCommand) || (!checkForPermissions(interaction.member) && botCommand)) return;
    if (!channel) reject({content: 'You must be in a voice channel to use music commands', ephemeral: true});
    
    if (interaction.guild.me.voice?.channelId && channel.id !== interaction.guild.me.voice.channelId) reject({content: 'You must be in the same voice channel as the bot', ephemeral: true});
    if (!checkForPermissions(interaction.member)) reject({content: 'You must have the DJ role or manage channels permission to use music commands', ephemeral: true})
    if (interaction.member.voice.selfDeaf || interaction.member.voice.serverDeaf) reject({content: 'You must be undeafened to use music commands', ephemeral: true});

    const serverQueue = queue.get(interaction.guildId);
    resolve([serverQueue, channel]);
  });
}