const {randomInt} = require('crypto');
const {readFileSync} = require('fs');
const {MessageEmbed} = require('discord.js');

function getRandom8Ball() {
  const file = JSON.parse(readFileSync('./txt/8ball.json', 'utf8'));
  const random = file[randomInt(0, file.length)];

  let color;
  if (random.type === 1) color = 'DARK_GREEN';
  else if (random.type === 2) color = 'YELLOW';
  else if (random.type === 3) color = 'RED';

  return {
    color: color,
    value: random.value
  };
}

module.exports = {
  name: "8ball",
  execute(interaction) {
    const msg = getRandom8Ball();
    const embed = new MessageEmbed()
    .setColor(msg.color)
    .setAuthor(interaction.user.tag, interaction.user.avatarURL())
    .setTitle('Magic 8-Ball')
    .setDescription(`🎱 ${msg.value}`)
    .setTimestamp();

    interaction.reply({embeds: [embed]}).catch(console.error);
  }
}