const fs = require('fs');
const fetch = require('node-fetch');
const {MessageEmbed} = require('discord.js');

async function reddit(interaction, count = 1) {
  for (let i = 0; i < count; i++) {
    try {
      const post = await fetch('https://www.reddit.com/r/dankmemes/random/.json').then(res => res.json());
      const data = post[0].data.children[0].data;
      if (data['is_video']) return reddit(interaction);

      const embed = new MessageEmbed()
      .setColor('RANDOM')
      .setTitle(data.title)
      .setAuthor(data.author)
      .setImage(data.url);

      if (i < 1) interaction.reply({embeds: [embed]});
      else interaction.followUp({embeds: [embed]});
    } catch(err) {
      interaction.reply({
        content: 'An unknown error occured, please try again later',
        ephemeral: true
      }).catch(console.error);
    }
  }
}

function isBetween(arg, min, max) {
  return parseInt(arg) >= min && parseInt(arg) <= max;
}

module.exports = {
  data: {
    name: "meme",
    description: "Returns a meme, either from r/dankmemes or the local memes folder if requested",
    category: "memes",
    options: [
      {
        name: "type",
        description: "The amount of memes to be sent, or to send a meme from the local memes folder",
        type: 3,
        required: false,
        choices: [
          {
            name: "once",
            value: "1"
          },
          {
            name: "twice",
            value: "2"
          },
          {
            name: "thrice",
            value: "3"
          },
          {
            name: "folder",
            value: "localfolder"
          }
        ]
      }
    ],
    examples: [
      "meme",
      "meme twice",
      "meme thrice",
      "meme localfolder"
    ]
  },
  execute(interaction) {
    const arg = interaction.options.get('type')?.value;
    if (!arg) return reddit(interaction);

    if (arg == 'localfolder') {
      const directory = fs.readdirSync('./pictures/memes');
      const random = directory[Math.floor(Math.random() * directory.length)];
      const file = `./pictures/memes/${random}`;

      interaction.reply({files: [file]}).catch(console.error);
    } else if (isBetween(arg, 1, 3)) {
      reddit(interaction, parseInt(arg));
    }
  }
}