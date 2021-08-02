module.exports = {
  name: 'ping',
  execute(interaction) {
    interaction.reply({content: `🏓 My time to respond is roughly ${interaction.client.ws.ping}ms`}).catch(console.error);
  }
}