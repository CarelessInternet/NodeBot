const fs = require('fs');

module.exports = (client, Discord) => {
  const prefix = '..!',
  loadDir = dirs => {
    const eventFiles = fs.readdirSync(`./events/${dirs}`).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
      const event = require(`../events/${dirs}/${file}`),
      eventName = file.split('.')[0];
      client.on(eventName, event.bind(null, client, Discord, prefix));
    }
  };

  ['client', 'guild'].forEach(e => loadDir(e));
};