const {randomInt} = require('crypto');
const {readFileSync} = require('fs');
const {MessageEmbed} = require('discord.js');

function getRandom8Ball() {
  const file = JSON.parse(readFileSync('./info/8ball.json', 'utf8'));
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
  data: {
    name: "8ball",
    description: "Magic 8-ball",
    category: "utility",
    options: [
      {
        name: "text",
        description: "Whatever input you wish to ask, this is not required",
        type: 3,
        required: false
      }
    ],
    examples: [
      "8ball",
      "8ball what is the meaning of life",
      "8ball why are you gay",
      "8ball who is joe"
    ]
  },
  execute(interaction) {
    const input = interaction.options.getString('text');
    const msg = getRandom8Ball();
    const embed = new MessageEmbed()
    .setColor(msg.color)
    .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL())
    .setTitle('Magic 8-Ball')
    .setTimestamp();

    if (input) {
      embed.setDescription(`Question: ${input}`);
      embed.addField('Answer:', `🎱 ${msg.value}`);
    } else {
      embed.setDescription(`🎱 ${msg.value}`);
    }

    interaction.reply({embeds: [embed]}).catch(console.error);
  }
}