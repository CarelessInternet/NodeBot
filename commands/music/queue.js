const check = require('../../musicCheck');
const {MessageEmbed} = require('discord.js');

// show queue
function getQueue(interaction, constructor) {
  if (!constructor) return;
  const embed = new MessageEmbed()
  .setColor('RANDOM')
  .setDescription(`${interaction.guild.name}${interaction.guild.name.toLowerCase().endsWith('s') ? '\'' : '\'s'} queue`)
  .setTitle('Video Queue')
  .setThumbnail(constructor.queue[0].image)
  .setTimestamp();

  constructor.queue.forEach((val, index) => {
    embed.addField(`${(index + 1).toString()}:`, val.title);
  });
  interaction.reply({embeds: [embed]}).catch(console.error);
}

module.exports = {
  data: {
    name: "queue",
    description: "Gets the queue",
    category: "music",
    options: [],
    examples: [
      "queue"
    ]
  },
  async execute(interaction, prefix, command, queue) {
    try {
      var [serverQueue] = await check(interaction, queue);
    } catch(err) {
      return interaction.reply(err);
    }

    getQueue(interaction, serverQueue);
  }
}