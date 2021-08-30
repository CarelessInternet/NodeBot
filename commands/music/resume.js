const check = require('../../musicCheck');

// resume current video
function resume(interaction, constructor) {
  if (!constructor) return interaction.reply({content: 'No video to resume', ephemeral: true}).catch(console.error);
  constructor.player.unpause();
  interaction.reply({content: '▶️ Resumed video'}).catch(console.error);
}

module.exports = {
  data: {
    name: "resume",
    description: "Resumes the current video",
    category: "music",
    options: [],
    examples: [
      "resume"
    ]
  },
  async execute(interaction, prefix, command, queue) {
    try {
      const [serverQueue] = await check(interaction, queue);
      resume(interaction, serverQueue);
    } catch(err) {
      console.error(err);
      interaction.reply({content: 'An unknown error occured, please try again later', ephemeral: true});
    }
  }
}