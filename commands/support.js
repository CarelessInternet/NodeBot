const fs = require('fs');

module.exports = {
  name: 'support',
  description: 'Sends the support server link',
  async execute(msg, args, Discord) {
    await msg.channel.send(new Discord.MessageEmbed().addField('Support', fs.readFileSync('./txt/support.txt', 'utf8')));
  }
};