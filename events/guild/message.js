const cooldowns = new Map();

module.exports = async (client, Discord, prefix, msg) => {
  if (!msg.guild) return;
  if (!msg.content.startsWith(prefix) || msg.author.bot) return;
  
  const perm = checkPermissions(msg.guild.me);
  if (perm) return await msg.channel.send(perm);

  // divide message into an array of words
  const args = msg.content.slice(prefix.length).split(/ +/),
  cmd = args.shift().toLowerCase(),
  command = client.commands.get(cmd),
  musicCommands = a => {
    return a === 'play' || a === 'leave' || a === 'skip' || a === 'queue' || a === 'pause' || a === 'resume' || a === 'unpause' || a === 'volume' || a === 'loop' || a === 'unloop' || a === 'remove';
  };

  if (!command && !musicCommands(cmd)) return;
  if (!cooldowns.has(cmd)) {
    cooldowns.set(cmd, new Discord.Collection());
  }
  const currentTime = Date.now(),
  timeStamps = cooldowns.get(cmd),
  cooldownAmount = (command != undefined && command.cooldown != undefined ? command.cooldown : 3) * 1000;

  if (timeStamps.has(msg.author.id)) {
    const expirationTime = timeStamps.get(msg.author.id) + cooldownAmount;
    if (currentTime < expirationTime) {
      const timeLeft = ((expirationTime - currentTime) / 1000).toFixed(1);
      return msg.reply(`Please wait ${timeLeft} more ${timeLeft == 1 ? 'second' : 'seconds'} before using the ${cmd} command`);
    }
  }
  timeStamps.set(msg.author.id, currentTime);
  setTimeout(() => timeStamps.delete(msg.author.id), cooldownAmount);

  switch (cmd) {
    case 'rickroll':
      command.execute(msg, args);
      return client.commands.get('music').execute(msg, ['rick astley never gonna give you up'], 'play', true);
    case 'amogus':
      command.execute(msg, args);
      return client.commands.get('music').execute(msg, ['among us drip theme song original'], 'play', true);
    case 'desc':
      return command.execute(msg, args, musicCommands);
    case 'music':
      return;
    default:
      break;
  }

  if (musicCommands(cmd))
    return client.commands.get('music').execute(msg, args, cmd);
  else if (command)
    return command.execute(msg, args, Discord, prefix);
};
function checkPermissions(perm) {
  if (!perm.hasPermission('READ_MESSAGE_HISTORY')) return 'I need the read message history permission to run commands';
  if (!perm.hasPermission('VIEW_CHANNEL')) return 'I need the view channels permission to run commands';
  if (!perm.hasPermission('SEND_MESSAGES')) return 'I need the send messages permission to run commands';
  if (!perm.hasPermission('ADD_REACTIONS')) return 'I need the add reactions permission to run certain commands';
  // if (!perm.hasPermission('MANAGE_MESSAGES')) return 'I need the manage messages permission to run certain commands';
  if (!perm.hasPermission('EMBED_LINKS')) return 'I need the embed links permission to run certain commands';
  if (!perm.hasPermission('ATTACH_FILES')) return 'I need the attach files permission to run certain commands';
  if (!perm.hasPermission('CONNECT')) return 'I need the connect permission to run certain commands';
  if (!perm.hasPermission('SPEAK')) return 'I need the speak permission to run certain commands';
  return;
}