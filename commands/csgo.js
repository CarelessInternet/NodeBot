const fetch = require('node-fetch');
const randomHexColor = require('random-hex-color');

module.exports = {
  name: 'csgo',
  description: 'Returns CS:GO stats info about a player. Use the Steam ID as the username, and the profle must be public for it to work.',
  async execute(msg, args, Discord) {
    if (!args[0]) return msg.channel.send('Please include the Steam ID');
    try {
      const username = encodeURIComponent(args.join(' '));
      const key = process.env.trackerGGAPIKey;
      const profile = await fetch(`https://public-api.tracker.gg/v2/csgo/standard/profile/steam/${username}`, {
        method: 'get',
        headers: {
          'TRN-Api-Key': key
        }
      }).then(res => res.json());
      if (profile.errors) throw profile.errors[0].message;

      const platform = profile.data.platformInfo;
      const stats = profile.data.segments[0].stats;
      const embed = new Discord.MessageEmbed()
      .setColor(randomHexColor())
      .setTitle(`${platform.platformUserHandle}${platform.platformUserHandle.toLowerCase().endsWith('s') ? '\'' : '\'s'} CS:GO Stats`)
      .setDescription('This commmand allows you to see a player\'s CS:GO stats. Stats + info might be a bit wrong, but don\'t blame me, blame the API')
      .addFields({
        name: stats.timePlayed.displayName,
        value: stats.timePlayed.displayValue,
        inline: true
      }, {
        name: stats.moneyEarned.displayName,
        value: stats.moneyEarned.displayValue,
        inline: true
      }, {
        name: stats.score.displayName,
        value: stats.score.displayValue,
        inline: true
      }, {
        name: '\u200B',
        value: '\u200B'
      }, {
        name: stats.kd.displayName,
        value: `**${stats.kd.displayValue}**\nTop ${Math.ceil(100 - stats.kd.percentile)}%`,
        inline: true
      }, {
        name: stats.kills.displayName,
        value: `**${stats.kills.displayValue}**\nTop ${Math.ceil(100 - stats.kills.percentile)}%`,
        inline: true
      }, {
        name: stats.wlPercentage.displayName,
        value: `**${stats.wlPercentage.displayValue}**\nTop ${Math.ceil(100 - stats.wlPercentage.percentile)}%`,
        inline: true
      }, {
        name: stats.mvp.displayName,
        value: `**${stats.mvp.displayValue}**\nTop ${Math.ceil(100 - stats.mvp.percentile)}%`,
        inline: true
      }, {
        name: stats.headshots.displayName,
        value: `**${stats.headshots.displayValue}**\nTop ${Math.ceil(100 - stats.headshots.percentile)}%`,
        inline: true
      }, {
        name: stats.damage.displayName,
        value: `**${stats.damage.displayValue}**\nTop ${Math.ceil(100 - stats.damage.percentile)}%`,
        inline: true
      })
      .setImage(platform.avatarUrl)
      .setTimestamp()
      .setFooter(`Steam User ID: ${platform.platformUserId}`);

      msg.channel.send(embed);
    } catch(err) {
      msg.channel.send(err || 'An unknown error occured, please try again later');
    }
  }
};