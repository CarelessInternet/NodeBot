const Discord = require('discord.js');
const flags = Discord.Intents.FLAGS;
const client = new Discord.Client({
  intents: [flags.GUILDS, flags.GUILD_MESSAGES, flags.GUILD_MESSAGE_REACTIONS, flags.GUILD_VOICE_STATES, flags.GUILD_PRESENCES, flags.DIRECT_MESSAGES, flags.DIRECT_MESSAGE_REACTIONS],
  shards: 'auto'
});
const token = process.env.token;

client.commands = new Discord.Collection();
client.events = new Discord.Collection();

['command_handler', 'event_handler'].forEach(handler => {
  require(`./handlers/${handler}`)(client, Discord);
});

client.login(token);