const {MessageEmbed} = require('discord.js');

module.exports = {
  name: 'bot-stats',
  async execute(interaction) {
    try {
      const {shard} = interaction.client;
      const promises = [
        shard.fetchClientValues('guilds.cache.size'),
        shard.fetchClientValues('emojis.cache.size'),
        shard.fetchClientValues('channels.cache.size'),
        shard.fetchClientValues('users.cache.size'),
        shard.broadcastEval(c => c.guilds.cache.reduce((acc, curr) => acc + curr.memberCount, 0))
      ];

      const [guildSize, emojiSize, channelSize, userSize, memberSize] = await Promise.all(promises);
      const embed = new MessageEmbed()
      .setColor('RANDOM')
      .setAuthor(interaction.user.tag, interaction.user.avatarURL())
      .setTitle('Bot Stats')
      .setDescription('Shows stats of the bot, like the amount of guilds')
      .addFields({
        name: 'Servers',
        value: '📊 ' + guildSize.reduce((acc, curr) => acc + curr, 0).toLocaleString(),
        inline: true
      }, {
        name: 'Server Members',
        value: '👥 ' + memberSize.reduce((acc, curr) => acc + curr, 0).toLocaleString(),
        inline: true
      }, {
        name: 'Users',
        value: '👤 ' + userSize.reduce((acc, curr) => acc + curr, 0).toLocaleString(),
        inline: true
      }, {
        name: '\u200B',
        value: '\u200B'
      }, {
        name: 'Channels',
        value: '📺 ' + channelSize.reduce((acc, curr) => acc + curr, 0).toLocaleString(),
        inline: true
      }, {
        name: 'Emojis',
        value: '💩 ' + emojiSize.reduce((acc, curr) => acc + curr, 0).toLocaleString(),
        inline: true
      })
      .setTimestamp();

      interaction.reply({embeds: [embed]});
    } catch(err) {
      console.error(err);
      interaction.reply({content: 'An unknown error occured whilst fetching data, please try again later', ephemeral: true});
    }
  }
}