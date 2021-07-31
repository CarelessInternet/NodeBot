const fs = require('fs'),
fetch = require('node-fetch');

module.exports = {
  name: 'meme',
  description: 'Sends a random meme from r/memes, add \'localfolder\' as the parameter for memes from the local memes folder',
  execute(msg, args) {
    if (!args.length) return reddit();
    if (args[0].toLowerCase() == 'localfolder') {
      return folder();
    } else if (isNaN(args[0])) {
      msg.channel.send('Parameter is not a number, sending 1 meme');
      return reddit();
    }
    if (Number(args[0]) <= 3 && Number(args[0]) >= 1) {
      return reddit(Number(args[0]));
    } else {
      msg.channel.send('Number must be between 1-3, sending 1 meme');
      return reddit();
    }

    function reddit(count = 1) {
      for (let i = 0; i < count; i++) {
        fetch('https://www.reddit.com/r/memes/random/.json')
        .then(res => res.json())
        .then(async res => await msg.channel.send('', {files: [res[0].data.children[0].data.url]}))
        .catch(err => msg.channel.send('Error occured while trying to receive or send a meme'));
      }
    }
    async function folder() {
      let files = fs.readdirSync('./pictures/memes');
      await msg.channel.send('', {files: [`./pictures/memes/${files[Math.floor(Math.random() * files.length)]}`]});
    }
  }
};