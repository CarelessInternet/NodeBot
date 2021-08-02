const cooldowns = new Map();

async function interaction(client, Discord, prefix, interaction) {
  if (!interaction.isCommand()) return;
  if (interaction.user.bot) return;

  const cmd = interaction.commandName.toLowerCase();
  const command = client.commands.get(cmd);

  if (!command && !isMusicCommand(cmd)) return;
  const hasCooldown = cooldown(interaction, Discord, cmd, command);
  if (hasCooldown) return interaction.reply({content: hasCooldown, ephemeral: true}).catch(console.error);

  // switch statement for commands which we have to give special parameters for
  switch (cmd) {
    case 'rickroll':
      command.execute(interaction);
      return client.commands.get('music')?.execute(interaction, 'play', ['rick astley never gonna give you up'], true);
    case 'amogus':
      command.execute(interaction);
      return client.commands.get('music')?.execute(interaction, 'play', ['among us drip theme song original'], true);
    case 'desc':
      return command.execute(interaction, isMusicCommand);
    case 'music':
      return;
    default:
      break;
  }

  // if the command exists in the commands folder, run it
  if (isMusicCommand(cmd)) return client.commands.get('music').execute(interaction, cmd);
  else if (command) command.execute(interaction, prefix);
}

function cooldown(interaction, Discord, cmd, command) {
  if (!cooldowns.has(cmd)) cooldowns.set(cmd, new Discord.Collection());

  // third const: if the cooldown amount exists, set it to cooldown amount * 1000 ms, otherwise set it to 3 * 1000 ms
  const currentTime = Date.now();
  const timestamps = cooldowns.get(cmd);
  const amount = (command?.cooldown || 3) * 1000;

  if (timestamps.has(interaction.user.id)) {
    const expirationTime = timestamps.get(interaction.user.id) + amount;
    if (currentTime < expirationTime) {
      const timeLeft = ((expirationTime - currentTime) / 1000).toFixed(1);
      return `Please wait ${timeLeft} more ${timeLeft == 1 ? 'second' : 'seconds'} before using the ${cmd} command`;
    }
  }

  timestamps.set(interaction.user.id, currentTime);
  setTimeout(() => timestamps.delete(interaction.user.id), amount);
}

function isMusicCommand(cmd) {
  return cmd === 'play' || cmd === 'leave' || cmd === 'skip' || cmd === 'queue' || cmd === 'pause' || cmd === 'resume' || cmd === 'unpause' || cmd === 'volume' || cmd === 'loop' || cmd === 'unloop' || cmd === 'remove';
}

module.exports = interaction;