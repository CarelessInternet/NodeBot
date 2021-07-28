const fs = require('fs');

module.exports = {
  name: 'desc',
  description: 'Gives short descriptions of commands available in the server',
  execute(msg, args, isMusicCommand) {
    if (!args[0]) return msg.reply('Missing requested command').catch(console.error);
    const arg = isMusicCommand(args[0]) ? 'music' : args[0];

    if (!fs.existsSync(`./commands/${arg}.js`)) return msg.reply('Requested command does not exist').catch(console.error);
    const {name, description} = require(`./${arg}.js`);
    msg.channel.send(`${name}${arg === 'music' ? ' (not a command)' : ''}: ${description}`).catch(console.error);
  }
};