const randomHexColor = require('random-hex-color');

module.exports = {
  name: 'poll',
  description: 'Creates a poll with the votes as reactions',
  cooldown: 60,
  async execute(msg, args, Discord) {
    const content = args.join(' ').split('. ');
    if (!msg.guild.me.hasPermission('MANAGE_MESSAGES')) return await msg.reply('I need the manage messages permission to run this command');
    if ((!content[0] && !content[1] && !content[2]) || args.length == 0 || content.length < 3) return await msg.reply('Title, amount of hours and at least one option are required. Please make sure you spelt the syntax correctly for this command');

    const title = content[0],
    duration = !isNaN(content[1]) ? Number(content[1]) : 1,
    color = randomHexColor(),
    embed = new Discord.MessageEmbed()
    .setColor(color)
    .setTitle(title)
    .setDescription('Choose an option:')
    .setFooter(`Set Duration: ${duration} ${duration == 1 ? 'hour' : 'hours'}`);

    content.splice(0, 2);
    if (content.length >= 6) return await msg.reply('Cannot have more than 6 fields, maximum is 5');
    content.forEach(async (element, index) => await embed.addField(`${index + 1}:`, element));

    const message = await msg.channel.send(embed),
    emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    content.forEach(async (element, index) => await message.react(`${emojis[index]}`));

    setTimeout(async () => {
      const newEmbed = new Discord.MessageEmbed()
      .setColor(color)
      .setTitle(title)
      .setDescription('Results:')
      .setFooter(`Duration of the poll: ${duration} ${duration == 1 ? 'hour' : 'hours'}`);
      content.forEach(async (element, index) => {
        const count = message.reactions.cache.get(emojis[index]).count - 1;
        await newEmbed.addField(`${index + 1}:`, `${element}\n${count} ${count == 1 ? 'Vote' : 'Votes'}`)
      });
      await message.edit(newEmbed);
      message.reactions.removeAll();
    }, duration * 60 * 60 * 1000);
  }
};