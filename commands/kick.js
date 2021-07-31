module.exports = {
  name: 'kick',
  description: 'Kicks a specific user from the server (both the bot and you need the kick members permission to run this command)',
  async execute(msg, args) {
    const member = msg.mentions.users.first();
    if (!args[0]) return await msg.reply('Please specify a user');
    if (!msg.guild.me.hasPermission('KICK_MEMBERS')) return await msg.reply('I need the kick members permission in order to run this command');
    if (!msg.guild.me.hasPermission('MANAGE_MESSAGES')) return await msg.reply('I need the manage messages permission to run this command');
    if (!msg.member.permissions.has('KICK_MEMBERS')) return await msg.reply('You do not have the right permissions to kick a member');
    
    if (member != undefined) {
      const confirmation = await msg.channel.send('Are you sure you want to kick this member?'),
      emojis = ['✅', '❎'],
      filter = (reaction, user) => {
        return emojis.includes(reaction.emoji.name) && user.id === msg.author.id;
      };
      await confirmation.react(emojis[0]);
      await confirmation.react(emojis[1]);

      confirmation.awaitReactions(filter, {max: 1, time: 5 * 1000, errors: ['time']}).then(async collected => {
        const reaction = collected.first().emoji.name;
        if (reaction === emojis[0]) {
          const target = msg.guild.members.cache.get(member.id);
          await target.kick();
          await confirmation.reactions.removeAll();
          await msg.channel.send('User has been successfully kicked from the server');
        } else if (reaction === emojis[1]) {
          await msg.channel.send('Kick has been aborted');
        }
      }).catch(async (error) => {
        if (error.httpStatus) {
          await confirmation.reactions.removeAll();
          await msg.reply(`Failed to kick, usually because the requested user is also a mod/admin on the server.\nCode: ${error.code}\nHTTP status code: ${error.httpStatus}`);
        } else {
          await msg.reply('Kick aborted because you did not respond in time');
        }
      });
    } else {
      await msg.reply('User does not exist in the server');
    }
  }
};