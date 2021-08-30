const {MessageEmbed} = require('discord.js');

module.exports = {
  data: {
    name: "ping",
    description: "Sends a pong back with the bot's current average response time",
    category: "utility",
    options: [],
    examples: [
      "ping"
    ]
  },
  async execute(interaction) {
    try {
      const embed = new MessageEmbed()
      .setColor('RANDOM')
      .setTitle('Pinging...');
      const message = await interaction.reply({embeds: [embed], fetchReply: true});

      embed.setTitle('Result:');
      embed.addFields({
        name: 'Websocket Ping',
        value: `⌛ ${interaction.client.ws.ping}ms`
      }, {
        name: 'Roundtrip Latency',
        value: `🏓 Roughly ${message.createdTimestamp - interaction.createdTimestamp}ms`
      });

      message.edit({embeds: [embed]});
    } catch(err) {
      console.error(err);
      interaction.editReply({
        content: 'An unknown error occured whilst trying to ping, please try again later',
        ephemeral: true
      }).catch(console.error);
    }
  }
}