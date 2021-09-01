const check = require('../../musicCheck');

// unloop the current video
function unloop(interaction, constructor) {
  if (!constructor) return interaction.reply({content: 'No video to unloop', ephemeral: true}).catch(console.error);
  constructor.loop = false;
  interaction.reply({content: '🔁 Loop is now off'}).catch(console.error);
}

module.exports = {
  data: {
    name: "unloop",
    description: "Unloops the current video",
    category: "music",
    options: [],
    examples: [
      "unloop"
    ]
  },
  async execute(interaction, prefix, command, queue) {
    try {
      var [serverQueue] = await check(interaction, queue);
    } catch(err) {
      return interaction.reply(err);
    }

    unloop(interaction, serverQueue);
  }
}