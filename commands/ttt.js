const TicTacToe = require('discord-tictactoe');
const game = new TicTacToe({language: 'en'});

module.exports = {
  name: 'ttt',
  description: 'Tic Tac Toe game used with the discord-tictactoe NPM package',
  execute(msg) {
    msg.reply('This command is currently not available. The module hasn\'t been updated for discord.js v13 and I can\'t be bothered creating tic-tac-toe myself').catch(console.error);
    // if (!msg.guild.me.permissions.has('MANAGE_MESSAGES')) return msg.reply('I need the manage messages permission to run this command').catch(console.error);
    // game.handleMessage(msg);
  }
};