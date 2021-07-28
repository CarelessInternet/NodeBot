const cooldowns = new Map();

function message(client, Discord, prefix, msg) {
  // dont do anything if the message is from a dm, doesnt start with the prefix or is from a bot
  if (!msg.guild) return;
  if (!msg.content.startsWith(prefix) || msg.author.bot) return;

  // first const: an array of arguments
  // second const: the string after the prefix, this is needed for commands where they dont have a file
  // third const: the command in the commands folder
  const args = msg.content.slice(prefix.length).split(/ +/);
  const cmd = args.shift().toLowerCase();
  const command = client.commands.get(cmd);

  const hasCooldown = cooldown(msg, Discord, cmd, command);
  if (hasCooldown) return msg.reply(hasCooldown).catch(console.error);

  // if the command exists in the commands folder, run it
  if (command) command.execute(msg, args, Discord, prefix);
}
function cooldown(msg, Discord, cmd, command) {
  if (!cooldowns.has(cmd)) cooldowns.set(cmd, new Discord.Collection());

  // third const: if the cooldown amount exists, set it to cooldown amount * 1000 ms, otherwise set it to 3 * 1000 ms
  const currentTime = Date.now();
  const timestamps = cooldowns.get(cmd);
  const amount = (command?.cooldown || 3) * 1000;

  if (timestamps.has(msg.author.id)) {
    const expirationTime = timestamps.get(msg.author.id) + amount;
    if (currentTime < expirationTime) {
      const timeLeft = ((expirationTime - currentTime) / 1000).toFixed(1);
      return `Please wait ${timeLeft} more ${timeLeft == 1 ? 'second' : 'seconds'} before using the ${cmd} command`;
    }
  }

  timestamps.set(msg.author.id, currentTime);
  setTimeout(() => timestamps.delete(msg.author.id), amount);
}

module.exports = message;