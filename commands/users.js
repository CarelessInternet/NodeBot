module.exports = {
  data: {
    name: "users",
    description: "Get the amount of users in the discord server excluding bots",
    category: "utility",
    options: [
      {
        name: "role",
        description: "The amount of users with this role that aren't bots",
        type: 8,
        required: false
      }
    ],
    examples: [
      "users",
      "users @administrator",
      "users @bots",
      "users @server boosters"
    ]
  },
  execute(interaction) {
    if (!interaction.inGuild()) return interaction.reply({content: 'This command is only available in a server'}).catch(console.error);
    const role = interaction.options.get('role')?.role;
    
    try {
      if (role) {
        if (role.name === '@everyone') return interaction.reply({content: 'You must choose a valid role', ephemeral: true});
        const amount = role.members.map(member => !member.user.bot).length;
        interaction.reply({content: `${amount} ${amount === 1 ? 'user' : 'users'} in the server with the <@&${role.id}> role`});
      } else {
        const amount = interaction.guild.members.cache.filter(member => !member.user.bot).size;
        interaction.reply({content: `${amount} ${amount === 1 ? 'user' : 'users'} in this server`});
      }
    } catch(err) {
      console.error(err);
      interaction.reply({
        content: 'An unknown error occured, please try again later',
        ephemeral: true
      }).catch(console.error);
    }
  }
}