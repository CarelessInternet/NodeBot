module.exports = {
  name: 'say',
  execute(interaction) {
    const arg = interaction.options.get('text')?.value;
    if (interaction.inGuild() && !interaction.member.permissions.has('MANAGE_CHANNELS')) return interaction.reply({content: 'You need the manage channels persmission to run this command', ephemeral: true}).catch(console.error);

    interaction.reply({content: 'Sending...', ephemeral: true}).catch(console.error);
    interaction.channel.send({content: arg})
    .then(msg => interaction.editReply({content: 'Sent!'}))
    .catch(console.error);
  }
}