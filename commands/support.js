const fs = require('fs');
const {MessageEmbed} = require('discord.js');

module.exports = {
  data: {
    name: "support",
    description: "Sends the support server link",
    category: "other",
    options: [],
    examples: [
      "support"
    ]
  },
  execute(interaction) {
    const embed = new MessageEmbed().addField('Support', fs.readFileSync('./info/support.txt', 'utf8'));
    interaction.reply({embeds: [embed]}).catch(console.error);
  }
}