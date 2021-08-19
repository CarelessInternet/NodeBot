const fs = require('fs');
const {REST} = require('@discordjs/rest');
const {Routes} = require('discord-api-types/v9');

function handler(client, Discord) {
  // get all javascript files in the commands folder
  const files = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
  for (const file of files) {
    const command = require(`../commands/${file}`);
    if (command.name) client.commands.set(command.name, command);
    else continue;
  }

  const rest = new REST({version: '9'}).setToken(process.env.token);
  (async () => {
    try {
      console.log('Started refreshing application (/) commands');
      const commands = JSON.parse(fs.readFileSync('./txt/data.json', 'utf8'));
      await rest.put(Routes.applicationCommands(process.env.clientID), {body: commands});
      
      console.log('Successfully reloaded application (/) commands');
    } catch(err) {
      console.error(err);
    }
  })();
}

module.exports = handler;