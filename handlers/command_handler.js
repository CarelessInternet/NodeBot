const fg = require('fast-glob');

async function handler(client, Discord) {
  // get all javascript files in the commands folder
  const files = await fg('./commands/**/*.js', {dot: true});
  for (const file of files) {
    const command = require(`.${file}`);
    client.commands.set(command.data.name, command);
  }
}

module.exports = handler;