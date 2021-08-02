const fs = require('fs');

async function message(client, Discord, msg) {
  if (!client.application?.owner) await client.application?.fetch();

  if (msg.content.toLowerCase() === '..deploy' && msg.author.id === client.application?.owner.id) {
    const data = await JSON.parse(fs.readFileSync('./txt/data.json', 'utf8'));
    await client.application?.commands.set(data);
  }
}

module.exports = message;