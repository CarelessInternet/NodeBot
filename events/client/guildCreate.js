const fs = require('fs');
const randomHexColor = require('random-hex-color');

async function onCreate(client, Discord, prefix, guild) {
  if (!guild.systemChannel) return;
  const file = await fs.readFileSync('./txt/invited.txt', 'utf8');
  const file2 = await fs.readFileSync('./txt/support.txt', 'utf8');
  const text = await file.replace(new RegExp('{prefix}', 'g'), prefix);
  const embed = new Discord.MessageEmbed()
  .setColor(randomHexColor())
  .setTitle('Hello!')
  .setDescription(text)
  .addField('Support Server', file2)
  .setTimestamp();

  if (guild.me.permissions.has('ADMINISTRATOR')) guild.systemChannel.send({embeds: [embed]}).catch(console.error);
}

module.exports = onCreate;