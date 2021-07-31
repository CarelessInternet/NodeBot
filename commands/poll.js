const progressBar = require('string-progressbar');
const randomHexColor = require('random-hex-color');

module.exports = {
  name: 'poll',
  description: 'Creates a poll with the votes as reactions',
  cooldown: 30,
  async execute(msg, args, Discord) {
    if (!msg.guild.me.permissions.has('MANAGE_MESSAGES')) return msg.reply('I need the manage messages permission to run this command').catch(console.error);
    // divide message content by dots
    const content = args.join(' ').split('. ');
    
    // if missing option or more than 4 options
    if (content.length < 3) return msg.reply('The title, amount of hours and at least one option are required to run this command').catch(console.error);
    if (content.length > 6) return msg.reply('You may only have up to 4 fields').catch(console.error);

    // all info for the embed
    const title = content[0];
    const duration = !isNaN(content[1]) ? parseFloat(content[1]) : 1;
    const color = randomHexColor();
    const embed = new Discord.MessageEmbed()
    .setColor(color)
    .setTitle(title)
    .setDescription('Choose an option:')
    .setFooter(`Duration of the Poll: ${duration} ${duration == 1 ? 'hour' : 'hours'}`);

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
    const row = new Discord.MessageActionRow();
    content.splice(0, 2);
    content.forEach((val, index) => {
      amount.push(0);
      embed.addField(`${index + 1}:`, `${val} | Votes: 0`);
      row.addComponents(
        new Discord.MessageButton()
        .setCustomId((index + 1).toString())
        .setLabel(emojis[index].emoji)
        .setStyle(emojis[index].style)
      );
    });

    // filter by available buttons and those who havent voted
    const filter = i => (i.customId === '1' || i.customId === '2' || i.customId === '3' || i.customId === '4') && !voted.includes(i.member.id);
    const message = await msg.channel.send({embeds: [embed], components: [row]}).catch(console.error);
    const collector = message.createMessageComponentCollector({filter, time: duration * 60 * 60 * 1000});

    // increment votes by one for whatever field they voted for
    collector.on('collect', i => {
      const num = parseInt(i.customId);
      amount[num - 1]++;
      voted.push(i.member.id);
      embed.fields[num - 1] = {name: `${num}:`, value: `${content[num - 1]} | **Votes**: ${amount[num - 1]}`};
      
      i.update({embeds: [embed], components: [row]}).catch(console.error);
    });
    collector.on('end', async (collected, reason) => {
      switch (reason) {
        case 'time': {
          // display bar and update description
          for (let i = 0; i < embed.fields.length; i++) {
            const total = amount.reduce((acc, curr) => acc + curr, 0);
            const bar = await progressBar.filledBar(total, amount[i]);
  
            embed.fields[i] = {
              name: `${i + 1}:`,
              value: `${content[i]} | **Votes**: ${amount[i]}\n${bar[0]}`
            }
          }
          embed.description = 'Result:';

          return message.edit({embeds: [embed], components: []}).catch(console.error);
        }
        case 'messageDelete':
          return msg.channel.send('Poll aborted because the message was deleted').catch(console.error);
        case 'channelDelete':
          return;
        case 'guildDelete':
          return;
        case 'limit':
          return;
        default:
          return msg.channel.send('Poll aborted due to an unknown reason').catch(console.error);
      }
    });
  }
}