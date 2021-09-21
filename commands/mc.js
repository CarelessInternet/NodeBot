const util = require('minecraft-server-util');
const {MessageAttachment, MessageEmbed} = require('discord.js');

module.exports = {
  data: {
    name: "mc",
    description: "Returns information abou a Minecraft Server",
    category: "game",
    options: [
      {
        name: "ip",
        description: "The IP of the Minecraft Server",
        type: 3,
        required: true
      },
      {
        name: "port",
        description: "The port of the Minecraft Server, default is 25565",
        type: 4,
        required: true
      }
    ],
    examples: [
      "mc hypixel.net 25565",
      "mc play.cubecraft.net 25565",
      "mc someserver.com 42069",
      "mc somemoreservers.org 1337"
    ]
  },
  execute(interaction) {
    const args = [interaction.options.get('ip')?.value, interaction.options.get('port')?.value];
    util.status(args[0], {port: args[1], timeout: 1000}).then(res => {
      const embed = new MessageEmbed()
      .setColor('RANDOM')
      .setTitle('Minecraft Server Info')
      .addFields(
        {name: 'Server IP', value: res.host},
        {name: 'Current Online', value: res.onlinePlayers.toLocaleString()},
        {name: 'Maximum Players', value: res.maxPlayers.toLocaleString()},
        {name: 'Version', value: res.version}
      )
      .setTimestamp()
      .setFooter('Default port for Minecraft Servers: 25565');

      let attachment;
      if (res.favicon) {
        const img = Buffer.from(res.favicon.split(',')[1], 'base64');
        attachment = new MessageAttachment(img, 'favicon.png');
        embed.setThumbnail('attachment://favicon.png');
      }

      interaction.reply({
        embeds: [embed],
        ...(attachment) && {files: [attachment]}
      }).catch(console.error);
    }).catch(err => {
      let reason = '';

      if (!err) reason = 'An unknown error occured whilst trying to reach the server';
      else if (err.code === 'ECONNREFUSED') reason = 'Invalid port, please change the port';
      else if (err.code === 'ENOTFOUND') reason = 'Invalid Server IP';
      else if (err.code === 'ERR_ASSERTION') reason = 'Port must be less than 65536';
      else if (err.code === 'ETIMEDOUT') reason = 'Connection timed out whilst trying to reach the Minecraft Server';
      else reason = 'An unknown error occured, please try again later';

      interaction.reply({
        content: reason,
        ephemeral: true
      }).catch(console.error);
    });
  }
}