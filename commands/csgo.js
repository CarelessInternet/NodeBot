const fetch = require('node-fetch');
const {MessageEmbed} = require('discord.js');

function getInfo(stat, top = false) {
  // example: K/D (new line) 1.31 (new line) Top 17%
  return {
    inline: true,
    name: stat.displayName,
    value: top ? `**${stat.displayValue}**\nTop ${Math.ceil(100 - stat.percentile)}%` : stat.displayValue
  }
}

module.exports = {
  data: {
    name: "csgo",
    description: "Returns CS:GO stats about a player. Use the Steam ID, and profile must be public for it to work",
    category: "game",
    options: [
      {
        name: "id",
        description: "The Steam ID, the last part of the URL when looking at a steam profile",
        type: 3,
        required: true
      }
    ],
    examples: [
      "csgo noprofilephoto",
      "csgo anomaly",
      "csgo LindisXd",
      "csgo dev1ce"
    ]
  },
  async execute(interaction) {
    const arg = interaction.options.getString('id');
    try {
      const username = encodeURIComponent(arg);
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
      const embed = new MessageEmbed()
      .setColor('RANDOM')
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
      .setThumbnail(platform.avatarUrl)
      .setTimestamp()
      .setFooter(`Steam User ID: ${platform.platformUserId}`);

      interaction.reply({embeds: [embed]}).catch(console.error);
    } catch(err) {
      interaction.reply({
        content: err || 'An unknown error occured, please try again later',
        ephemeral: true
      }).catch(console.error);
    }
  }
}