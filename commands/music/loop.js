const check = require('../../musicCheck');

// loop the current video
function loop(interaction, constructor) {
  if (!constructor) return interaction.reply({content: 'No video to loop', ephemeral: true}).catch(console.error);
  constructor.loop = true;
  interaction.reply({content: '🔁 Loop is now on'}).catch(console.error);
}

module.exports = {
  data: {
    name: "loop",
    description: "Loops the current video",
    category: "music",
    options: [],
    examples: [
      "loop"
    ]
  },
  async execute(interaction, prefix, command, queue) {
    try {
      const [serverQueue] = await check(interaction, queue);
      loop(interaction, serverQueue);
    } catch(err) {
      console.error(err);
      interaction.reply({content: 'An unknown error occured, please try again later', ephemeral: true});
    }
  }
}