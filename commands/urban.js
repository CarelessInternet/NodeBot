const fetch = require('node-fetch');
const dateFormat = require('dateformat');
const {MessageEmbed} = require('discord.js');

module.exports = {
  name: 'urban',
  async execute(interaction) {
    try {
      const word = interaction.options.getString('word');
      const query = new URLSearchParams(word).toString();
      const result = await fetch(`https://api.urbandictionary.com/v0/define?term=${query}`).then(res => res.json());
      if (!result['list'].length) return interaction.reply({content: 'No results found', ephemeral: true});

      const list = result['list'][0];
      const embed = new MessageEmbed()
      .setColor('RANDOM')
      .setAuthor(list['author'])
      .setTitle(list['word'])
      .setURL(list['permalink'])
      .setDescription(list['definition'])
      .addFields({
        name: 'Likes',
        value: list['thumbs_up'].toString(),
        inline: true
      }, {
        name: 'Dislikes',
        value: list['thumbs_down'].toString(),
        inline: true
      }, {
        name: 'Timestamp',
        value: dateFormat(list['written_on'], 'yyyy-mm-dd HH:MM:ss p'),
        inline: true
      })
      .setTimestamp();

      interaction.reply({embeds: [embed]});
    } catch(err) {
      console.error(err);
      interaction.reply({content: 'An unknown error occured, please try again later', ephemeral: true});
    }
  }
}