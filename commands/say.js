module.exports = {
  name: 'say',
  async execute(interaction) {
    if (!interaction.inGuild()) return interaction.reply({content: 'You must be in a guild to use this command'}).catch(console.error);
    if (!interaction.member.permissions.has('MANAGE_CHANNELS')) return interaction.reply({content: 'You need the manage channels persmission to run this command', ephemeral: true}).catch(console.error);
    const arg = interaction.options.get('text')?.value;

    await interaction.reply({content: 'Sending...', ephemeral: true}).catch(console.error);
    interaction.channel.send({content: arg})
    .then(msg => interaction.editReply({content: 'Sent!'}).catch(console.error))
    .catch(console.error);
  }
}