const fs = require('fs');
const dateFormat = require('dateformat');
const connection = require('../../db');
const cooldowns = new Map();

async function interaction(client, Discord, prefix, interaction) {
  if (!interaction.isCommand()) return;
  if (interaction.user.bot) return;

  const cmd = interaction.commandName.toLowerCase();
  const command = client.commands.get(cmd) || client.commands.find(file => file.aliases?.includes(cmd));

  if (!command) return;
  const isBlacklisted = await blacklist(interaction, Discord);
  if (isBlacklisted) return interaction.reply({embeds: [isBlacklisted], ephemeral: true}).catch(console.error);
  
  const hasCooldown = cooldown(interaction, Discord, cmd);
  if (hasCooldown) return interaction.reply({content: hasCooldown, ephemeral: true}).catch(console.error);

  // switch statement for commands which we have to run another command
  switch (cmd) {
    case 'rickroll':
      command.execute(interaction);
      return client.commands.get('music')?.execute(interaction, prefix, 'play', ['rick astley never gonna give you up'], true);
    case 'amogus':
      command.execute(interaction);
      return client.commands.get('music')?.execute(interaction, prefix, 'play', ['among us drip theme song original'], true);
    default:
      break;
  }

  // if the command exists in the commands folder or aliases array, run it
  if (command) command.execute(interaction, prefix, cmd);
}

function hasBlacklist(userID, guildID) {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM Blacklist WHERE TargettedUserID = ? AND GuildID = ?', [userID, guildID], (err, rows) => {
      if (err) reject(err);
      resolve(rows[0] ?? false);
    });
  });
}
async function blacklist(interaction, Discord) {
  try {
    if (!interaction.inGuild()) return false;

    const blacklist = await hasBlacklist(interaction.user.id, interaction.guildId);
    if (!blacklist || interaction.member.permissions.has('MANAGE_CHANNELS')) return false;
  
    const embed = new Discord.MessageEmbed()
    .setColor('RED')
    .setAuthor(interaction.user.tag, interaction.user.avatarURL())
    .setTitle('You are Blacklisted')
    .setDescription('You are blacklisted from using NodeBot commands, please contact the server mods/admins if you have any questions')
    .addFields({
      name: 'Reason',
      value: blacklist['Reason'],
      inline: true
    }, {
      name: 'Blacklist Date',
      value: `${dateFormat(blacklist['CreationDate'], 'longDate')} at ${dateFormat(blacklist['CreationDate'], 'isoTime')}`,
      inline: true
    }, {
      name: 'Blacklist By',
      value: `<@${blacklist['CreatorUserID']}>`,
      inline: true
    })
    .setTimestamp();
  
    return embed;
  } catch(err) {
    console.error(err);
    return false;
  }
}

function cooldown(interaction, Discord, cmd) {
  if (!cooldowns.has(cmd)) cooldowns.set(cmd, new Discord.Collection());

  // third const: if the cooldown amount exists, set it to cooldown amount * 1000 ms, otherwise set it to 3 * 1000 ms
  const currentTime = Date.now();
  const timestamps = cooldowns.get(cmd);
  const file = JSON.parse(fs.readFileSync('./txt/data.json')).find(val => val.name === cmd);
  const amount = (file.cooldown || 3) * 1000;
  const key = interaction.guild ? interaction.user.id + interaction.guildId : interaction.user.id;

  if (timestamps.has(key)) {
    const expirationTime = timestamps.get(key) + amount;
    if (currentTime < expirationTime) {
      const timeLeft = ((expirationTime - currentTime) / 1000).toFixed(1);
      return `Please wait ${timeLeft} more ${timeLeft == 1 ? 'second' : 'seconds'} before using the ${cmd} command`;
    }
  }

  timestamps.set(key, currentTime);
  setTimeout(() => timestamps.delete(key), amount);
}

module.exports = interaction;