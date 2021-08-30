require('dotenv').config();

const fg = require('fast-glob');
const {REST} = require('@discordjs/rest');
const {Routes} = require('discord-api-types/v9');

const rest = new REST({version: '9'}).setToken(process.env.token);
(async () => {
  try {
    console.log('Started refreshing application (/) commands');
    const files = await fg('./commands/**/*.js', {dot: true});
    const guildCommands = [];
    const commands = files.reduce((acc, file) => {
      const {data} = require(file);
      if (!data.guild) acc.push(data);
      else guildCommands.push(data);
      return acc;
    }, []);
    await rest.put(Routes.applicationCommands(process.env.clientID), {body: commands});
    if (guildCommands[0]) await rest.put(Routes.applicationGuildCommands(process.env.clientID, process.env.guildID), {body: guildCommands});

    console.log('Successfully reloaded application (/) commands');
  } catch(err) {
    console.error(err);
  }
})();