const fs = require('fs');

async function message(client, Discord, prefix, msg) {
  if (!client.application?.owner) await client.application?.fetch();

  if (msg.content.toLowerCase() === '..deploy' && msg.author.id === client.application?.owner.id) {
    try {
      const data = await JSON.parse(fs.readFileSync('./txt/data.json', 'utf8'));
      await client.application?.commands.set(data);
  
      console.log('Successfully deployed commands!');
    } catch(err) {
      console.error(err);
    }
  }
}

module.exports = message;