module.exports = {
  name: 'ping',
  execute(interaction) {
    interaction.reply({content: 'pong блядь'}).catch(console.error);
  }
}