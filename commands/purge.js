module.exports = {
  name: 'purge',
  async execute(interaction) {
    if (!interaction.inGuild()) return interaction.reply({content: 'You need to be in server to use this command'}).catch(console.error);
    if (!interaction.member.permissions.has('MANAGE_MESSAGES')) return interaction.reply({content: 'You need the manage messages permission to run this command', ephemeral: true}).catch(console.error);
    if (!interaction.guild.me.permissions.has('MANAGE_MESSAGES')) return interaction.reply({content: 'I need the manage messages permission to run this command'}).catch(console.error);

    try {
      const amount = interaction.options.get('amount')?.value;
      if (amount < 1 || amount > 100) return interaction.reply({content: 'Amount must be at minimum 1 and at maximum 100', ephemeral: true});

      const channel = await interaction.client.channels.fetch(interaction.channelId);
      const deleted = await channel.bulkDelete(amount);

      interaction.reply({content: `👍 Successfully deleted the last ${deleted.size} messages`});
    } catch(err) {
      interaction.reply({
        content: 'An error occured whilst trying to purge messages, please try again later',
        ephemeral: true
      }).catch(console.error);
    }
  }
}