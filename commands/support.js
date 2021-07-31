const fs = require('fs');

module.exports = {
  name: 'support',
  description: 'Sends the support server link',
  execute(msg, args, Discord) {
    const embed = new Discord.MessageEmbed().addField('Support', fs.readFileSync('./txt/support.txt', 'utf8'));
    msg.channel.send({embeds: [embed]}).catch(console.error);
  }
};