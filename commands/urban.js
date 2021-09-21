const fetch = require('node-fetch');
const dateFormat = require('dateformat');
const {MessageEmbed} = require('discord.js');

module.exports = {
  data: {
    name: "urban",
    description: "Returns the urban definition of a word. Could potentially contain NSFW content",
    category: "other",
    options: [
      {
        name: "word",
        description: "The word you want to get the definiton of",
        type: 3,
        required: true
      }
    ],
    examples: [
      "urban joe mamma",
      "urban hello world",
      "urban fatneek",
      "urban sample text"
    ]
  },
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
        value: `<t:${Math.floor(new Date(list['written_on']).getTime() / 1000)}:R>`,
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