module.exports = {
  name: 'rps',
  description: 'Rock Paper Scissors game against bot',
  async execute(msg, args, Discord) {
    if (!msg.guild.me.hasPermission('MANAGE_MESSAGES')) return await msg.reply('I need the manage messages permission to run this command');
    const embed = new Discord.MessageEmbed()
    .setTitle('Rock Paper Scissors')
    .setDescription('React to play')
    .setTimestamp(),
    message = await msg.channel.send(embed),
    rps = ['🗿', '📄', '✂'];

    await message.react(rps[0]);
    await message.react(rps[1]);
    await message.react(rps[2]);

    const filter = (reaction, user) => {
      return rps.includes(reaction.emoji.name) && user.id === msg.author.id;
    },
    botChoice = rps[Math.floor(Math.random() * rps.length)];

    message.awaitReactions(filter, {max: 1, time: 60 * 1000, errors: ['time']}).then(async collected => {
      const reaction = collected.first().emoji.name,
      result = new Discord.MessageEmbed()
      .setTitle('Result')
      .addFields(
        {name: 'Your choice', value: reaction},
        {name: 'Bot\'s choice', value: botChoice},
        {name: 'Outcome', value: outcome()}
      );
      await message.edit(result);

      function outcome() {
        message.reactions.removeAll();
        if ((reaction === rps[0] && botChoice === rps[2]) || (reaction === rps[2] && botChoice === rps[1]) || (reaction === rps[1] && botChoice === rps[0]))
          return 'Win';
        else if (reaction === botChoice)
          return 'Tie';
        else
          return 'Loss';  
      }
    }).catch(async () => {
      await message.reactions.removeAll();
      await msg.reply('Game aborted because you did not react to any emoji');
    });
  }
};