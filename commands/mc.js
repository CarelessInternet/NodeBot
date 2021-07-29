const util = require('minecraft-server-util');
const randomHexColor = require('random-hex-color');

module.exports = {
  name: 'mc',
  description: 'Information about a specified Minecraft Server',
  execute(msg, args, Discord) {
    if (!args[0]) return msg.channel.send('Please enter the Minecraft Server IP').catch(console.error);
    util.status(args[0], {port: !isNaN(args[1]) ? parseInt(args[1]) : 25565, timeout: 1000}).then(res => {
      const embed = new Discord.MessageEmbed()
      .setColor(randomHexColor())
      .setTitle('Minecraft Server Info')
      .addFields(
        {name: 'Server IP', value: `${res.host}`},
        {name: 'Current Online', value: res.onlinePlayers.toString()},
        {name: 'Maximum Players', value: res.maxPlayers.toString()},
        {name: 'Version', value: res.version}
      )
      .setImage(`attachment://favicon.png`)
      .setTimestamp()
      .setFooter('Default port for Minecraft Servers: 25565');

      let attachment;
      if (res.favicon) {
        const img = Buffer.from(res.favicon.split(',')[1], 'base64');
        attachment = new Discord.MessageAttachment(img, 'favicon.png');
        embed.setImage('attachment://favicon.png');
      }

      msg.channel.send({
        embeds: [embed],
        ...(attachment) && {files: [attachment]}
      }).catch(console.error);
    }).catch(err => {
      if (!err) return msg.channel.send('An unknown error occured whilst trying to reach the server').catch(console.error);

      if (err.code === 'ECONNREFUSED') msg.reply('Invalid port, please add a port after the IP or change it').catch(console.error);
      else if (err.code === 'ENOTFOUND') msg.reply('Invalid Server IP').catch(console.error);
      else if (err.code === 'ERR_ASSERTION') msg.reply('Port must be less than 65536').catch(console.error);
      else if (err.code === 'ETIMEDOUT') msg.channel.send('Connection timed out whilst trying to reach the Minecraft Server').catch(console.error);
      else msg.channel.send('An unknown error occured, please try again later').catch(console.error);
    });
  }
};