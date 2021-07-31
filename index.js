/* NodeBot */
require('dotenv').config();

const Discord = require('discord.js'),
client = new Discord.Client(),
token = process.env.token;

client.commands = new Discord.Collection();
client.events = new Discord.Collection();
['command_handler', 'event_handler'].forEach(handler => {
  require(`./handlers/${handler}`)(client, Discord);
});
client.login(token);

// setInterval(() => {
//   const {rss, heapTotal, heapUsed} = process.memoryUsage();
//   console.table([rss / 1024 / 1024, heapTotal / 1024 / 1024, heapUsed / 1024 / 1024]);
// }, 5 * 1000);