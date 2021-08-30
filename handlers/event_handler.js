const fs = require('fs');

function handler(client, Discord) {
  const prefix = '/';
  const loadDirectories = dirs => {
    // get all javascript files from each handler folder specified by dirs
    const files = fs.readdirSync(`./events/${dirs}`).filter(file => file.endsWith('.js'));
    for (const file of files) {
      const event = require(`../events/${dirs}/${file}`);
      const name = file.split('.')[0];
      if (name === 'ready')
        client.once(name, event.bind(null, client, Discord, prefix));
      else
        client.on(name, event.bind(null, client, Discord, prefix));
    }
  };

  ['client', 'guild'].forEach(dir => loadDirectories(dir));
}

module.exports = handler;