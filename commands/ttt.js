const TicTacToe = require('discord-tictactoe');
const game = new TicTacToe({language: 'en'});

module.exports = {
  data: {
    name: "ttt",
    description: "Tic Tac Toe game made possible with the discord-tictactoe NPM package",
    category: "game",
    options: [
      {
        name: "user",
        description: "The user you want to battle against",
        type: 6,
        required: false
      }
    ],
    examples: [
      "ttt",
      "ttt @Owner#6969",
      "ttt @DeezNuts#0001",
      "ttt @ihatedoingthis#9999"
    ]
  },
  execute(interaction) {
    interaction.reply({
      content: 'This command is currently not available. The module hasn\'t been updated for discord.js v13 yet and I can\'t be bothered creating tic-tac-toe myself'
    }).catch(console.error);
    // if (interaction.inGuild() && !interaction.guild.me.permissions.has('MANAGE_MESSAGES')) return interaction.reply({content: 'I need the manage messages permission to run this command', ephemeral: true}).catch(console.error);
    // game.handleMessage(interaction);
  }
}