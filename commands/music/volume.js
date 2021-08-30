const check = require('../../musicCheck');

// changes volume of the bot for the channel
function volume(interaction, constructor) {
  const arg = interaction.options.get('volume')?.value;
  if (!constructor) return interaction.reply({content: 'No video to change volume to', ephemeral: true}).catch(console.error);

  if (arg > 2 || arg < 0) return interaction.reply({content: 'Volume must be between 0 and 2', ephemeral: true}).catch(console.error);
  constructor.volume = arg;
  constructor.resource.volume.setVolume(arg);
  interaction.reply({content: `${arg > 1 ? '🔊' : '🔉'} Volume changed to ${arg}`}).catch(console.error);
}

module.exports = {
  data: {
    name: "volume",
    description: "Changes the volume of the bot",
    category: "music",
    options: [
      {
        name: "volume",
        description: "The volume to change it to",
        type: 10,
        required: true
      }
    ],
    examples: [
      "volume 0.69",
      "volume 1",
      "volume 1.5",
      "volume 2"
    ]
  },
  async execute(interaction, prefix, command, queue) {
    try {
      const [serverQueue] = await check(interaction, queue);
      volume(interaction, serverQueue);
    } catch(err) {
      console.error(err);
      interaction.reply({content: 'An unknown error occured, please try again later', ephemeral: true});
    }
  }
}