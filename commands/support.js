const fs = require('fs');
const {MessageEmbed} = require('discord.js');

module.exports = {
  name: 'support',
  execute(interaction) {
    const embed = new MessageEmbed().addField('Support', fs.readFileSync('./txt/support.txt', 'utf8'));
    interaction.reply({embeds: [embed]}).catch(console.error);
  }
}