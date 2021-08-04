const progressBar = require('string-progressbar');
const {MessageActionRow, MessageButton, MessageEmbed} = require('discord.js');

module.exports = {
  name: 'poll',
  cooldown: 30,
  async execute(interaction) {
    if (!interaction.inGuild()) return interaction.reply({content: 'You must be in a guild to use this command'}).catch(console.error);
    if (!interaction.guild.me.permissions.has('MANAGE_MESSAGES')) return interaction.reply({content: 'I need the manage messages permission to run this command'}).catch(console.error);

    const title = interaction.options.get('title')?.value;
    const hours = interaction.options.get('hours')?.value;
    const fields = [
      interaction.options.get('field1')?.value,
      interaction.options.get('field2')?.value,
      interaction.options.get('field3')?.value,
      interaction.options.get('field4')?.value
    ];
    if (hours * 60 * 60 * 1000 > 2147483647) return interaction.reply({content: 'Hours must be less than 596.5, or 24.85 days', ephemeral: true}).catch(console.error);

    const embed = new MessageEmbed()
    .setColor('RANDOM')
    .setTitle(title)
    .setDescription('Choose an option:')
    .setTimestamp()
    .setFooter(`Duration of the poll: ${hours} ${hours == 1 ? 'hour' : 'hours'}`);
    const emojis = [{
      emoji: '1️⃣',
      style: 'PRIMARY'
    }, {
      emoji: '2️⃣',
      style: 'SECONDARY'
    }, {
      emoji: '3️⃣',
      style: 'SUCCESS'
    }, {
      emoji: '4️⃣',
      style: 'DANGER'
    }];

    // voted for who has already voted and amount for how many votes each field has
    const voted = [];
    const amount = [];
    const row = new MessageActionRow();
    fields.forEach((val, index) => {
      if (!val) return;

      amount.push(0);
      embed.addField(`${index + 1}:`, `${val} | **Votes**: 0`);
      row.addComponents(
        new MessageButton()
        .setCustomId((index + 1).toString())
        .setLabel(emojis[index].emoji)
        .setStyle(emojis[index].style)
      );
    });
    interaction.reply({content: 'Creating poll...'}).catch(console.error);
    interaction.deleteReply().catch(console.error);

    // filter by available buttons and those who haven't voted
    const filter = i => (i.customId === '1' || i.customId === '2' || i.customId === '3' || i.customId === '4') && !voted.includes(i.member.id);
    const message = await interaction.channel.send({
      embeds: [embed],
      components: [row],
      fetchReply: true
    }).catch(console.error);
    const collector = message.createMessageComponentCollector({filter, time: hours * 60 * 60 * 1000});

    // increment votes by one for whatever field they voted for
    collector.on('collect', i => {
      const num = parseInt(i.customId) - 1;
      amount[num]++;
      voted.push(i.member.id);
      embed.fields[num].value = `${fields[num]} | **Votes**: ${amount[num]}`;

      i.update({
        embeds: [embed],
        components: [row]
      }).catch(console.error);
    });
    collector.on('end', async (collected, reason) => {
      switch (reason) {
        case 'time': {
          // display bar and update description
          for (let i = 0; i < embed.fields.length; i++) {
            const total = amount.reduce((acc, curr) => acc + curr, 0) || 1;
            const bar = await progressBar.filledBar(total, amount[i]);
            embed.fields[i].value += `\n${bar[0]}`;
          }

          embed.description = `Amount of Votes: ${collected.size}`;
          return message.edit({
            embeds: [embed],
            components: []
          }).catch(console.error);
        }
        case 'messageDelete':
          return interaction.channel.send('Poll aborted because the message was deleted').catch(console.error);
        case 'channelDelete':
          return;
        case 'guildDelete':
          return;
        case 'limit':
          return;
        default:
          return interaction.channel.send('Poll aborted due to an unknown reason').catch(console.error);
      }
    });
  }
}