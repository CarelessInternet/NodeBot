const check = require('../../musicCheck');
const {MessageEmbed} = require('discord.js');

// show queue
function getQueue(interaction, constructor) {
  if (!constructor) return;
  const embed = new MessageEmbed()
  .setColor('RANDOM')
  .setDescription(`${interaction.guild.name}${interaction.guild.name.toLowerCase().endsWith('s') ? '\'' : '\'s'} Queue`)
  .setTitle('Video Queue')
  .setImage(constructor.queue[0].image)
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
      const [serverQueue] = await check(interaction, queue);
      getQueue(interaction, serverQueue);
    } catch(err) {
      console.error(err);
      interaction.reply({content: 'An unknown error occured, please try again later', ephemeral: true});
    }
  }
}