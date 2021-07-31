module.exports = (client, Discord, prefix) => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity(`nothing | ${prefix}help`, {type: 'LISTENING'});
};