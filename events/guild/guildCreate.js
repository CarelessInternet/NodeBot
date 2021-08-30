const {readFileSync} = require('fs');

async function onCreate(client, Discord, prefix, guild) {
  if (!guild.systemChannel) return;
  const file = readFileSync('./info/invited.txt', 'utf8');
  const file2 = readFileSync('./info/support.txt', 'utf8');
  const file3 = readFileSync('./info/invite.txt', 'utf8');
  const text = await file.replace(new RegExp('{prefix}', 'g'), prefix);
  const embed = new Discord.MessageEmbed()
  .setColor('RANDOM')
  .setTitle('Hello!')
  .setDescription(text)
  .addField('Support Server', file2)
  .addField('Invite Link', file3)
  .setTimestamp();

  if (guild.me.permissions.has('ADMINISTRATOR')) guild.systemChannel.send({embeds: [embed]}).catch(console.error);
}

module.exports = onCreate;