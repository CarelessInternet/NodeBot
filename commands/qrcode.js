const qrcode = require('qrcode');
const {MessageAttachment} = require('discord.js');

module.exports = {
  data: {
    name: "qrcode",
    description: "Takes some input and convert it into a QR code",
    category: "utility",
    options: [
      {
        name: "input",
        description: "The input you want to generate into a QR code",
        type: 3,
        required: true
      }
    ],
    examples: [
      "qrcode why are you gae",
      "qrcode deez nuts",
      "qrcode https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "qrcode bruh"
    ]
  },
  async execute(interaction) {
    try {
      const text = interaction.options.getString('input');
      const buffer = await qrcode.toBuffer(text);
      const attachment = new MessageAttachment(buffer, 'qrcode.png');

      interaction.reply({files: [attachment]});
    } catch(err) {
      console.error(err);
      interaction.reply({content: 'An error occured whilst generating the QR code, please try again later', ephemeral: true});
    }
  }
}