const translate = require('@vitalets/google-translate-api');

module.exports = {
  name: 'translate',
  async execute(interaction) {
    // context menu command
    try {
      await interaction.deferReply({ephemeral: true});

      const {content} = interaction.options.getMessage('message');
      if (!content) return interaction.editReply({content: 'You must give a valid message to be translated'});

      const {text} = await translate(content, {to: 'en'});
      interaction.editReply({content: text});
    } catch(err) {
      console.error(err);
      interaction.followUp({content: 'An unknown error occured whilst translating, please try again later', ephemeral: true}).catch(console.error);
    }
  }
}