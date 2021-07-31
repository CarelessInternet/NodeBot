module.exports = {
  name: 'users',
  description: 'Get amount of users in discord server excluding bots. Optional parameter with role name for amount of users with that role',
  execute(msg, args) {
    if (args.join(' ')) {
      const role = msg.guild.roles.cache.find(role => role.name.toLowerCase() == args.join(' ').toLowerCase());
      if (!role) return msg.reply('Role does not exist').catch(console.error);

      const amount = msg.guild.roles.cache.get(role.id).members.map(member => !member.user.bot).length;
      msg.reply(`${amount} ${amount == 1 ? 'user' : 'users'} in the server with the \`${role.name}\` role`).catch(console.error);
    } else {
      const amount = msg.guild.members.cache.filter(member => !member.user.bot).size;
      msg.reply(`${amount} ${amount == 1 ? 'user' : 'users'} in this server`).catch(console.error);
    }
  }
};