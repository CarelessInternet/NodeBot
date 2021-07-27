function ready(client, Discord, prefix) {
  client.user.setActivity(`discord.js v13 | ${prefix}help`, {type: 'COMPETING'});
  console.log(`Logged in as ${client.user.tag}`);
}

module.exports = ready;