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
  name: 'meme',
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