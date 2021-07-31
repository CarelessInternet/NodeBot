const randomHexColor = require('random-hex-color');

function outcome(player, bot, emojis) {
  if ((player === emojis[0].id && bot === emojis[2].id) || (player === emojis[2].id && bot === emojis[1].id) || (player === emojis[1].id && bot === emojis[0].id))
    return 'Win';
  else if (player === bot)
    return 'Tie';
  else
    return 'Loss';
}

module.exports = {
  name: 'rps',
  description: 'Rock Paper Scissors game against a bot',
  async execute(msg, args, Discord) {
    if (!msg.guild.me.permissions.has('MANAGE_MESSAGES')) return msg.reply('I need the manage messages permission to run this command').catch(console.error);
    const embed = new Discord.MessageEmbed()
    .setColor(randomHexColor())
    .setTitle('Rock Paper Scissors')
    .setDescription('React to Play')
    .setTimestamp()
    .setFooter('The bot is just a random number generator');
    const buttons = [{
      id: 'Rock',
      emoji: '🗿'
    }, {
      id: 'Paper',
      emoji: '📄'
    }, {
      id: 'Scissors',
      emoji: '✂️'
    }];

    const row = new Discord.MessageActionRow()
    .addComponents(
      new Discord.MessageButton()
      .setCustomId(buttons[0].id)
      .setLabel(buttons[0].emoji)
      .setStyle('PRIMARY'),
      new Discord.MessageButton()
      .setCustomId(buttons[1].id)
      .setLabel(buttons[1].emoji)
      .setStyle('SUCCESS'),
      new Discord.MessageButton()
      .setCustomId(buttons[2].id)
      .setLabel(buttons[2].emoji)
      .setStyle('DANGER')
    );

    const filter = i => (i.customId === 'Rock' || i.customId === 'Paper' || i.customId === 'Scissors') && i.member.user.id === msg.author.id;
    const message = await msg.reply({embeds: [embed], components: [row]}).catch(console.error);
    const collector = message.createMessageComponentCollector({filter, max: 1, time: 15 * 1000});

    collector.on('collect', i => {
      const reaction = i.customId;
      const bot = buttons[Math.floor(Math.random() * buttons.length)];
      embed.addFields({
        name: 'Your Choice',
        value: buttons.filter(obj => obj.id === reaction)[0].emoji
      }, {
        name: 'Bot\'s Choice',
        value: bot.emoji
      }, {
        name: 'Outcome',
        value: outcome(reaction, bot.id, buttons)
      });

      i.update({embeds: [embed], components: []}).catch(console.error);
    });
    collector.on('end', (collected, reason) => {
      switch (reason) {
        case 'time':
          return message.edit({content: 'Game aborted due to no response', embeds: [], components: []}).catch(console.error);
        case 'messageDelete':
          return msg.channel.send('Game aborted because the message was deleted').catch(console.error);
        case 'channelDelete':
          return;
        case 'guildDelete':
          return;
        case 'limit':
          return;
        default:
          return msg.channel.send('Game aborted due to an unknown reason').catch(console.error);
      }
    })
  }
};