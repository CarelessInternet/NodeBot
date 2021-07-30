module.exports = {
  name: 'kick',
  description: 'Kicks a specific user from the server (both the bot and you need the kick members permission to run this command)',
  async execute(msg, args, Discord) {
    if (!args[0]) return msg.reply('Please specify a user').catch(console.error);
    if (!msg.guild.me.permissions.has('KICK_MEMBERS')) return msg.reply('I need the kick members permission to run this command').catch(console.error);
    if (!msg.guild.me.permissions.has('MANAGE_MESSAGES')) return msg.reply('I need the manage messages permission to run this command').catch(console.error);
    if (!msg.member.permissions.has('KICK_MEMBERS')) return msg.reply('You do not have the right permissions to kick a member').catch(console.error);

    const member = msg.mentions.users.first();
    if (!member) return msg.reply('The user does not exist in this server').catch(console.error);

    const filter = i => (i.customId === 'Kick_Confirm' || i.customId === 'Kick_Abort') && i.member.user.id === msg.author.id;
    const row = new Discord.MessageActionRow()
    .addComponents(
      new Discord.MessageButton()
      .setCustomId('Kick_Confirm')
      .setLabel('✔️')
      .setStyle('SUCCESS'),
      new Discord.MessageButton()
      .setCustomId('Kick_Abort')
      .setLabel('❌')
      .setStyle('DANGER')
    );
    const confirmation = await msg.reply({content: 'Are you sure you want to kick this member?', components: [row]}).catch(console.error);
    const collector = confirmation.createMessageComponentCollector({filter, max: 1, time: 7 * 1000});
    
    collector.on('collect', async i => {
      const reaction = i.customId;
      if (reaction === 'Kick_Confirm') {
        const target = msg.guild.members.cache.get(member.id);
        const reason = args.slice(1).join(' ') ?? '';
        if (target == msg.author.id) return i.update({content: 'You cannot kick yourself', components: []}).catch(console.error);
        if (target.permissions.has('KICK_MEMBERS')) return i.update({content: 'Failed to kick because the user has kick members permission', components: []}).catch(console.error);

        target.kick(reason)
        .then(user => i.update({content: `👍 ${user.id ? '<@' + user.id + '>' : user.user.username} has been kicked from ${msg.guild.name}`, components: []}))
        .catch(err => i.update({content: '👎 Failed to kick, usually because the user has some form of mod/admin on this server, or my highest role is listed lower than the requested user\'s roles', components: []}));
      } else if (reaction === 'Kick_Abort') {
        i.update({content: 'Kick has been aborted', components: []});
      }
    });
    collector.on('end', (collected, reason) => {
      switch (reason) {
        case 'time': {
          return confirmation.edit({content: 'Kick aborted due to no response', components: []}).catch(console.error);
        }
        case 'messageDelete': {
          return msg.channel.send('Kick aborted because the message was deleted').catch(console.error);
        }
        case 'limit': {
          return;
        }
        default: {
          return confirmation.edit({content: 'Kick aborted due to an unknown reason', components: []}).catch(console.error);
        }
      }
    });
  }
};