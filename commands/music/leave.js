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
      var [serverQueue] = await check(interaction, queue);
    } catch(err) {
      return interaction.reply(err);
    }

    leave(interaction, serverQueue);
  }
}