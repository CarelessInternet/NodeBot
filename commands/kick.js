module.exports = {
  name: 'kick',
  description: 'Kicks a specific user from the server (both the bot and you need the kick members permission to run this command)',
  async execute(msg, args) {
    if (!args[0]) return msg.reply('Please specify a user').catch(console.error);
    if (!msg.guild.me.permissions.has('KICK_MEMBERS')) return msg.reply('I need the kick members permission to run this command').catch(console.error);
    if (!msg.guild.me.permissions.has('MANAGE_MESSAGES')) return msg.reply('I need the manage messages permission to run this command').catch(console.error);
    if (!msg.member.permissions.has('KICK_MEMBERS')) return msg.reply('You do not have the right permissions to kick a member').catch(console.error);

    const member = msg.mentions.users.first();
    if (!member) return msg.reply('The user does not exist in this server').catch(console.error);

    const confirmation = await msg.channel.send('Are you sure you want to kick this member?').catch(console.error);
    const emojis = ['✅', '❌'];
    const filter = (reaction, user) => {return emojis.includes(reaction.emoji.name) && user.id === msg.author.id};
    
    await confirmation.react(emojis[0]).catch(console.error);
    await confirmation.react(emojis[1]).catch(console.error);

    const collector = confirmation.createReactionCollector({filter, max: 1, time: 15 * 1000});
    collector.on('collect', async collected => {
      const reaction = collected.emoji.name;

      if (reaction === emojis[0]) {
        const target = msg.guild.members.cache.get(member.id);
        const reason = args.slice(1).join(' ') ?? '';
  
        await target.kick(reason)
        .then(user => {
          msg.channel.send(`👍 ${user.id ? '<@' + user.id + '>' : user.user.username} has been kicked from ${msg.guild.name}`);
        })
        .catch(err => {
          msg.channel.send('👎 Failed to kick, probably because the user is a mod/admin on this server.');
        });
      } else if (reaction === emojis[1]) {
        return msg.channel.send('Kick has been aborted');
      }
      confirmation.reactions.removeAll().catch(console.error);
    });
    collector.on('end', (collected, reason) => {
      confirmation.reactions.removeAll().catch(console.error);
      switch (reason) {
        case 'time': {
          return msg.channel.send('Kick aborted due to no response').catch(console.error);
        }
        case 'messageDelete': {
          return msg.channel.send('Kick aborted because the message was deleted').catch(console.error);
        }
        case 'limit': {
          return;
        }
        default: {
          return msg.channel.send('Kick aborted due to an unknown reason').catch(console.error);
        }
      }
    });

    // confirmation.awaitReactions({filter, max: 1, time: 5 * 1000, errors: ['time']})
    // .then(async collected => {
    //   console.log(collected);
    //   const reaction = collected.first().emoji.name;
    //   if (reaction === emojis[1]) return msg.channel.send('Kick has been aborted').catch(console.error);
    // })
    // .catch(err => {
    //   confirmation.reactions.removeAll().catch(console.error);
    //   return msg.reply('Failed to kick because the message author didn\'t respond in time, message was deleted or the user is a mod/admin on this server').catch(console.error);
    // });
  }
};