const fs = require('fs');

module.exports = {
  name: 'desc',
  description: 'Gives short descriptions of commands available in the server',
  async execute(msg, args, musicCommands) {
    if (args[0]) {
      var arg = args[0];
      if (musicCommands(args[0])) arg = 'music';
      if (fs.existsSync(`./commands/${arg}.js`)) {
        const command = require(`./${arg}.js`);
        await msg.channel.send(`${arg === 'music' ? command.name + ' (not a command)' : command.name}: ${command.description}`);
      } else {
        await msg.reply('Requested command does not exist');
      }
    } else {
      await msg.reply('Missing requested command');
    }
  }
};