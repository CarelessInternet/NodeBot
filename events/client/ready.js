function ready(client, Discord, prefix) {
  client.user.setActivity(`wii sports | ${prefix}help`, {type: 'COMPETING'});
  console.log(`Logged in as ${client.user.tag}`);
}

module.exports = ready;