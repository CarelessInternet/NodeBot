const qrcode = require('qrcode');
const {MessageAttachment} = require('discord.js');

module.exports = {
  name: 'qrcode',
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