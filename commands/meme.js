const fs = require('fs');
const fetch = require('node-fetch');
const randomHexColor = require('random-hex-color');

async function reddit(msg, Discord, count = 1) {
  for (let i = 0; i < count; i++) {
    try {
      const post = await fetch('https://www.reddit.com/r/dankmemes/random/.json').then(res => res.json());
      const data = post[0].data.children[0].data;
      if (data['is_video']) return reddit(msg, Discord);

      const embed = new Discord.MessageEmbed()
      .setColor(randomHexColor())
      .setTitle(data.title)
      .setAuthor(data.author)
      .setImage(data.url);

      msg.channel.send({embeds: [embed]});
    } catch(err) {
      msg.channel.send('An unknown error occured, please try again later').catch(console.error);
    }
  }
}

function isBetween(arg, min, max) {
  return parseInt(arg) >= min && parseInt(arg) <= max;
}

module.exports = {
  name: 'meme',
  description: 'Sends a random meme from r/dankmemes, add a \'localfolder\' parameter for a meme from the local memes folder',
  execute(msg, args, Discord) {
    if (!args[0]) return reddit(msg, Discord);
    if (args[0].toLowerCase() === 'localfolder') {
      const directory = fs.readdirSync('./pictures/memes');
      const file = `./pictures/memes/${directory[Math.floor(Math.random() * directory.length)]}`;
      msg.channel.send({files: [file]}).catch(console.error);
    } else if (isNaN(args[0])) {
      reddit(msg, Discord);
    } else {
      reddit(msg, Discord, isBetween(args[0], 1, 3) ? parseInt(args[0]) : 1);
    }
  }
};