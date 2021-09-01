const check = require('../../musicCheck');

// skips current video
async function skip(interaction, constructor) {
  await interaction.deferReply().catch(console.error);

  if (!constructor) return interaction.followUp({content: 'No videos to skip in the queue'}).catch(console.error);
  interaction.followUp({content: 'Skipping video...'});
  constructor.player.stop();
}

module.exports = {
  data: {
    name: "skip",
    description: "Skips the current video",
    category: "music",
    options: [],
    examples: [
      "skip"
    ]
  },
  async execute(interaction, prefix, command, queue) {
    try {
      var [serverQueue] = await check(interaction, queue);
    } catch(err) {
      return interaction.reply(err);
    }

    skip(interaction, serverQueue);
  },
  skip
}