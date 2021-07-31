module.exports = {
  name: 'users',
  description: 'Get amount of users in discord server excluding bots and optional parameter with specific role',
  async execute(msg, args) {
    if (args.join(' ')) {
      const role = msg.guild.roles.cache.find(role => role.name.toLowerCase() == args.join(' ').toLowerCase());
      if (role != undefined) {
        const amount = msg.guild.roles.cache.get(role.id).members.map(member => !member.user.bot).length;
        await msg.channel.send(`${amount} ${amount == 1 ? 'user' : 'users'} in the server with the \`${role.name}\` role`);
      } else {
        await msg.channel.send('Role does not exist');
      }
    } else {
      const amount = msg.guild.members.cache.filter(member => !member.user.bot).size;
      await msg.channel.send(`${amount} ${amount == 1 ? 'user' : 'users'} in this server`);
    }
  }
};