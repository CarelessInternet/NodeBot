module.exports = {
  name: 'users',
  execute(interaction) {
    if (!interaction.inGuild()) return interaction.reply({content: 'This command is only available in a server'}).catch(console.error);
    const arg = interaction.options.get('role')?.value;

    if (arg) {
      const amount = interaction.guild.roles.cache.get(arg).members.map(member => !member.user.bot).length;
      interaction.reply({content: `${amount} ${amount == 1 ? 'user' : 'users'} in the server with the <@&${arg}> role`}).catch(console.error);
    } else {
      const amount = interaction.guild.members.cache.filter(member => !member.user.bot).size;
      interaction.reply({content: `${amount} ${amount == 1 ? 'user' : 'users'} in this server`}).catch(console.error);
    }
  }
}