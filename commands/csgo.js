const fetch = require('node-fetch');
const randomHexColor = require('random-hex-color');

function getInfo(stat, top = false) {
  return {
    // example: K/D (new line) 1.31 (new line) Top 17%
    inline: true,
    name: stat.displayName,
    value: top ? `**${stat.displayValue}**\nTop ${Math.ceil(100 - stat.percentile)}%` : stat.displayValue
  };
}

module.exports = {
  name: 'csgo',
  description: 'Returns CS:GO stats info about a player. Use the Steam ID as the username, and the profle must be public for it to work.',
  async execute(msg, args, Discord) {
    if (!args[0]) return msg.reply('Please include the Steam ID').catch(console.error);
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
      .addFields(
        getInfo(stats.timePlayed),
        getInfo(stats.moneyEarned),
        getInfo(stats.score),
        {name: '\u200B', value: '\u200B'},
        getInfo(stats.kd, true),
        getInfo(stats.kills, true),
        getInfo(stats.wlPercentage, true),
        getInfo(stats.mvp, true),
        getInfo(stats.headshots, true),
        getInfo(stats.damage, true)
      )
      .setImage(platform.avatarUrl)
      .setTimestamp()
      .setFooter(`Steam User ID: ${platform.platformUserId}`);

      msg.reply({embeds: [embed]}).catch(console.error);
    } catch(err) {
      msg.channel.send(err || 'An unknown error occured, please try again later').catch(console.error);
    }
  }
};