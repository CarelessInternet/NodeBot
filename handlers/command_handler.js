const fs = require('fs');

module.exports = (client, Discord) => {
  const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
  for (let file of commandFiles) {
    let command = require(`../commands/${file}`);
    if (command.name)
      client.commands.set(command.name, command);
    else
      continue;
  }
}