const fs = require('fs');

function handler(client, Discord) {
  // get all javascript files in the commands folder
  const files = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
  for (const file of files) {
    const command = require(`../commands/${file}`);
    if (command.name) client.commands.set(command.name, command);
    else continue;
  }
}

module.exports = handler;