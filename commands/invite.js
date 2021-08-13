const {readFileSync} = require('fs');
const {MessageEmbed} = require('discord.js');

module.exports = {
  name: 'invite',
  execute(interaction) {
    const file = readFileSync('./txt/invite.txt', 'utf8');
    const embed = new MessageEmbed()
    .setColor('RANDOM')
    .setTitle('Invite Link')
    .setDescription(file)
    .setTimestamp();

    interaction.reply({embeds: [embed]}).catch(console.error);
  }
}