module.exports = {
  name: 'say',
  description: 'Makes the bot say what you type',
  execute(msg, args) {
    if (!args[0]) return msg.reply('Missing something to type').catch(console.error);
    if (!msg.member.permissions.has('MANAGE_CHANNELS')) return msg.reply('You need the manage channels/administrator permission to run this command').catch(console.error);
    msg.channel.send(args.join(' ')).catch(console.error);
  }
}