const check = require('../../musicCheck');

// leaves voice channel
async function leave(interaction, constructor) {
  await interaction.deferReply({ephemeral: true}).catch(console.error);

  interaction.editReply({content: 'Disconnecting...'}).catch(console.error);
  constructor.connection.destroy();
}

module.exports = {
  data: {
    name: "leave",
    description: "Leaves the voice channel",
    category: "music",
    options: [],
    examples: [
      "leave"
    ]
  },
  async execute(interaction, prefix, command, queue) {
    try {
      const [serverQueue] = await check(interaction, queue);
      leave(interaction, serverQueue);
    } catch(err) {
      console.error(err);
      interaction.reply({content: 'An unknown error occured, please try again later', ephemeral: true});
    }
  }
}