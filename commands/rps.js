const {MessageActionRow, MessageButton, MessageEmbed} = require('discord.js');

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
  async execute(interaction) {
    if (!interaction.inGuild()) return interaction.reply({content: 'Unfortunately, the rps command is not available in DMs, please run this command in a server'}).catch(console.error);
    if (interaction.inGuild() && !interaction.guild.me.permissions.has('MANAGE_MESSAGES')) return interaction.reply({content: 'I need the manage messages permission to run this command', ephemeral: true}).catch(console.error);
    const embed = new MessageEmbed()
    .setColor('RANDOM')
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

    const row = new MessageActionRow()
    .addComponents(
      new MessageButton()
      .setCustomId(buttons[0].id)
      .setLabel(buttons[0].emoji)
      .setStyle('PRIMARY'),
      new MessageButton()
      .setCustomId(buttons[1].id)
      .setLabel(buttons[1].emoji)
      .setStyle('SUCCESS'),
      new MessageButton()
      .setCustomId(buttons[2].id)
      .setLabel(buttons[2].emoji)
      .setStyle('DANGER')
    );

    const filter = i => (i.customId === 'Rock' || i.customId === 'Paper' || i.customId === 'Scissors') && i.member.user.id === interaction.user.id;
    const message = await interaction.reply({
      embeds: [embed],
      components: [row],
      fetchReply: true
    }).catch(console.error);
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

      i.update({
        embeds: [embed],
        components: []
      }).catch(console.error);
    });
    collector.on('end', (collected, reason) => {
      switch (reason) {
        case 'time':
          return message.edit({
            content: 'Game aborted due to no response',
            ephemeral: true,
            embeds: [],
            components: []
          }).catch(console.error);
        case 'messageDelete':
          return interaction.channel.send({content: 'Game aborted because the message was deleted'}).catch(console.error);
        case 'channelDelete':
          return;
        case 'guildDelete':
          return;
        case 'limit':
          return;
        default:
          return interaction.channel.send({content: 'Game aborted due to an unknown reason'}).catch(console.error);
      }
    });
  }
}