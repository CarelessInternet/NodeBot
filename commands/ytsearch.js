const ytSearch = require('yt-search');
const {getBasicInfo} = require('ytdl-core');
const {MessageEmbed} = require('discord.js');

function videoFinder(query) {
  return new Promise(async (resolve, reject) => {
    try {
      // im gonna keep yt-search instead of using youtube api to limit quota usage
      const result = await ytSearch(query);
      resolve(result.videos?.[0]);
    } catch(err) {
      reject(err);
    }
  });
}
function ytdlInfo(url) {
  return new Promise(async (resolve, reject) => {
    try {
      const {videoDetails} = await getBasicInfo(url);
      resolve(videoDetails);
    } catch(err) {
      reject(err);
    }
  });
}

module.exports = {
  data: {
    name: "ytsearch",
    description: "Searches for a video on youtube and returns the first result",
    category: "utility",
    options: [
      {
        name: "query",
        description: "The video you want to search for",
        type: 3,
        required: true
      }
    ],
    examples: [
      "ytsearch me at the zoo",
      "ytsearch b*tch lasagna",
      "ytsearch idk something",
      "ytsearch jag vet inte"
    ]
  },
  async execute(interaction) {
    try {
      await interaction.deferReply();
      
      const input = interaction.options.getString('query');
      const video = await videoFinder(input);
      if (video) {
        const details = await ytdlInfo(video.url);
        const embed = new MessageEmbed()
        .setColor('RANDOM')
        .setTitle(details['title'])
        .setURL(details['video_url'])
        .setAuthor(details['author']['name'], details['author']['thumbnails'][0]['url'], details['author']['channel_url'])
        .setDescription(details['description'])
        .addFields({
          name: 'Views',
          value: parseInt(details['viewCount']).toLocaleString(),
          inline: true
        }, {
          name: 'Upload Date',
          value: details['uploadDate'],
          inline: true
        }, {
          name: 'Subscriber Count',
          value: details['author']['subscriber_count'].toLocaleString(),
          inline: true
        }, {
          name: 'Likes',
          value: !isNaN(details['likes']) ? details['likes'].toLocaleString() : 'Unavailable',
          inline: true
        }, {
          name: 'Dislikes',
          value: !isNaN(details['dislikes']) ? details['dislikes'].toLocaleString() : 'Unavailable',
          inline: true
        }, {
          name: 'Category',
          value: details['category'],
          inline: true
        })
        .setImage(details['thumbnails'][4]['url'])
        .setTimestamp()
        .setFooter(`Youtuber Verified: ${details['author']['verified'] ? 'True' : 'False'}`);

        interaction.editReply({embeds: [embed]});
      } else {
        await interaction.deleteReply();
        interaction.followUp({content: 'No video results found', ephemeral: true});
      }
    } catch(err) {
      console.error(err);
      await interaction.deleteReply();
      interaction.followUp({content: 'An unknown error occured whilst searching for a video, please try again later', ephemeral: true});
    }
  }
}