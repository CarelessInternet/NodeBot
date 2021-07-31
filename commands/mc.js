const util = require('minecraft-server-util');

module.exports = {
  name: 'mc',
  description: 'Information about a specified Minecraft Server',
  execute(msg, args, Discord) {
    if (!args[0]) return msg.channel.send('Please enter the Minecraft Server IP');
    try {
      util.status(args[0], {port: !isNaN(args[1]) ? parseInt(args[1]) : 25565, timeout: 1000}).then(async res => {
        const embed = new Discord.MessageEmbed()
        .setColor('#2e4ff2')
        .setTitle('Minecraft Server Info')
        .addFields(
          {name: 'Server IP', value: res.host},
          {name: 'Current Online', value: res.onlinePlayers},
          {name: 'Maximum Players', value: res.maxPlayers},
          {name: 'Version', value: res.version}
        );
  
        await msg.channel.send(embed);
      }).catch(async err => {
        if (!err) return await msg.channel.send('Error occured whilst trying to get to the server');
        if (err.code == 'ECONNREFUSED')
          await msg.channel.send('Invalid port, please add port after IP or change it')
        else if (err.code == 'ENOTFOUND')
          await msg.channel.send('Invalid server IP')
        else if (err.code == 'ETIMEDOUT')
          await msg.channel.send('Connection timed out whilst trying to reach the Minecraft Server');
        else
          await msg.channel.send(`Can't be bothered to debug error so here is json response: ${JSON.stringify(err)}`);
      });
    } catch (error) {
      msg.channel.send(`Error occured, error cuz i cant be bothered: ${error}`);
    }
  }
};