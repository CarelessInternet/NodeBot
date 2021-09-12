const check = require('../../musicCheck');
const {skip} = require('./skip');
const {MessageEmbed} = require('discord.js');

// removes video from queue
function remove(interaction, constructor) {
  if (!constructor) return interaction.reply({content: 'No videos to remove in the queue', ephemeral: true}).catch(console.error);
  const arg = interaction.options.get('index')?.value;
  const num = arg - 1;

  if (!constructor.queue[num]) return interaction.reply({content: 'Cannot find the video to remove', ephemeral: true}).catch(console.error);
  if (num === 0) return skip(interaction, constructor);
  const embed = new MessageEmbed()
  .setColor('RANDOM')
  .setTitle('Removing the following video:')
  .setDescription(`${constructor.queue[num].title} by ${constructor.queue[num].author.name}`)
  .setThumbnail(constructor.queue[num].image)
  .setTimestamp();

  constructor.queue.splice(num, num);
  interaction.reply({embeds: [embed]}).catch(console.error);
}

module.exports = {
  data: {
    name: "remove",
    description: "Removes a video from the queue",
    category: "music",
    options: [
      {
        name: "index",
        description: "The video to remove, use the number above the video as the video to remove",
        type: 4,
        required: true
      }
    ],
    examples: [
      "remove 1",
      "remove 3",
      "remove 5",
      "remove 69"
    ]
  },
  async execute(interaction, prefix, command, queue) {
    try {
      var [serverQueue] = await check(interaction, queue);
    } catch(err) {
      return interaction.reply(err);
    }

    remove(interaction, serverQueue);
  }
}