module.exports = {
  name: 'say',
  description: 'Makes the bot say what you type',
  execute(msg, args) {
    if (!args[0]) return msg.reply('Missing something to type');
    if (!msg.member.permissions.has('MANAGE_CHANNELS') || !msg.member.permissions.has('ADMINISTRATOR')) return msg.reply('You need the manage channels/administrator permission to run this command');
    msg.channel.send(args.join(' '));
  }
}