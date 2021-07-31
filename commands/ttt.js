const TicTacToe = require('discord-tictactoe'),
game = new TicTacToe({language: 'en'});

module.exports = {
  name: 'ttt',
  description: 'Tic Tac Toe game hosted with the discord-tictactoe NPM package',
  async execute(msg, args) {
    if (!msg.guild.me.hasPermission('MANAGE_MESSAGES')) return await msg.reply('I need the manage messages permission to run this command');
    await game.handleMessage(msg);
  }
};