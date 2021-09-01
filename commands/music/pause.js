const check = require('../../musicCheck');

// pause current video
function pause(interaction, constructor) {
  if (!constructor) return interaction.reply({content: 'No video to pause', ephemeral: true}).catch(console.error);
  constructor.player.pause();
  interaction.reply({content: '⏸️ Paused video'}).catch(console.error);
}

module.exports = {
  data: {
    name: "pause",
    description: "Pauses the current video",
    category: "music",
    options: [],
    examples: [
      "pause"
    ]
  },
  async execute(interaction, prefix, command, queue) {
    try {
      var [serverQueue] = await check(interaction, queue);
    } catch(err) {
      return interaction.reply(err);
    }

    pause(interaction, serverQueue);
  }
}