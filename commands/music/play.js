const search = require('youtube-search');
const secondarySearch = require('yt-search');
const ytdl = require('ytdl-core');
const {MessageEmbed} = require('discord.js');
const {joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus} = require('@discordjs/voice');
const check = require('../../musicCheck');

// reject if no result, resolve with video if result
function videoFinder(query) {
  // the reason why im not using the yt-search npm module is because
  // it takes a long time to get a response, which causes a small pause in the music
  // before resuming again, this is for performance reasons
  return new Promise(async (resolve, reject) => {
    try {
      const options = {
        key: process.env.youtubeAPIKey,
        type: 'video',
        maxResults: 1
      };
    
      const result = await search(query, options);
      if (!result.results[0]) reject('No search result found');
    
      const {link, description, title, thumbnails, channelTitle, id} = result.results[0];
      const {videoDetails} = await ytdl.getBasicInfo(link);

      resolve({
        title: title,
        url: link,
        author: {
          name: channelTitle,
          url: videoDetails['author']['channel_url']
        },
        description: description,
        image: thumbnails.high.url,
        duration: {
          seconds: parseInt(videoDetails.lengthSeconds),
          timestamp: `${Math.floor(parseInt(videoDetails.lengthSeconds) / 60)}:${('0' + Math.floor(parseInt(videoDetails.lengthSeconds) % 60)).slice(-2)}`
        },
        views: parseInt(videoDetails.viewCount),
        videoId: id
      });
    } catch(err) {
      // just in case the quota is exceeded or an error occures, we'll use the yt-search module
      const result = await secondarySearch(query).catch(reject);
      if (!result.videos?.[0]) reject('No search result found');

      resolve(result.videos[0]);
    }
  });
}
// prepares video before calling the video player function
async function play(interaction, queue, serverQueue, channel, botArg = '') {
  try {
    const arg = interaction.options.getString('video') ?? botArg;
    const video = await videoFinder(arg);
    if (video.duration?.seconds > 10800) return interaction.followUp({content: 'Video must be less than 3 hours long', ephemeral: true}).catch(console.error);
  
    if (!serverQueue) {
      // all necessary information needed for sending messages, setting up loops, queue system, etc
      const constructor = {
        queue: [],
        volume: 1,
        player: null,
        resource: null,
        connection: null,
        loop: false
      };
  
      // add the info into a map/hashmap with the key as the guild id
      queue.set(interaction.guild.id, constructor);
      constructor.queue.push(video);
  
      try {
        // idk what adapterCreator is but whatever, it's required
        const connection = await joinVoiceChannel({
          channelId: channel.id,
          guildId: channel.guild.id,
          adapterCreator: channel.guild.voiceAdapterCreator
        });
  
        connection.on(VoiceConnectionStatus.Disconnected, () => queue.delete(interaction.guild.id));
        connection.on(VoiceConnectionStatus.Destroyed, () => {
          queue.delete(interaction.guild.id);
          interaction.channel.send({content: '☠️ Disconnected from voice channel'}).catch(console.error);
        });
        connection.on('error', console.error);
        constructor.connection = connection;
  
        videoPlayer(interaction, constructor);
      } catch(err) {
        console.error(err);
        queue.get(interaction.guild.id).connection.destroy();
  
        interaction.followUp({content: 'There was an error creating a connection, please try again later', ephemeral: true}).catch(console.error);
      }
    } else {
      serverQueue.queue.push(video);
      interaction.followUp({content: `👍 Video added to queue: ***${video.title}***, length: **${video.duration.timestamp}**`}).catch(console.error);
    }
  } catch(e) {
    console.error(e);
    interaction.followUp({content: e ?? 'No search result found or some other error occured', ephemeral: true}).catch(console.error)
  }
}
// the function that actually plays the video
async function videoPlayer(interaction, constructor) {
  const songQueue = constructor.queue[0];
  const connection = constructor.connection;
  if (!songQueue) return connection.destroy();

  // create connection and play it
  const resource = await createAudioResource(ytdl(songQueue.url, {
    filter: 'audioonly',
    quality: 'highestaudio',
    highWaterMark: 1 << 25
  }), {inlineVolume: true});
  const player = createAudioPlayer();

  resource.volume.setVolume(constructor.volume);
  player.play(resource);
  connection.subscribe(player);
  constructor.resource = resource;
  constructor.player = player;

  // equivalent to on finish event
  player.on(AudioPlayerStatus.Idle, () => {
    // if there is a loop, replay video, otherwise delete video and move on to next one
    if (constructor.loop) return videoPlayer(interaction, constructor);
    constructor.queue.shift();
    videoPlayer(interaction, constructor);
  });
  player.on('error', err => {
    console.error(err);
    interaction.followUp({content: 'An unknown error occured whilst creating the audio resource, please try again later'});
  });

  if (!constructor.loop) {
    const embed = new MessageEmbed()
    .setColor('RANDOM')
    .setTitle(songQueue.title)
    .setURL(songQueue.url)
    .setAuthor(songQueue.author.name)
    .setDescription(songQueue.description)
    .addFields({
      name: '\u200B',
      value: '\u200B'
    },
    {
      name: 'Link to Channel',
      value: `[${songQueue.author.name}](${songQueue.author.url})`,
      inline: true
    }, {
      name: 'Timestamp',
      value: songQueue.duration.timestamp,
      inline: true
    }, {
      name: 'Views',
      value: songQueue.views.toLocaleString(),
      inline: true
    })
    .setImage(songQueue.image)
    .setTimestamp()
    .setFooter(`Video ID: ${songQueue.videoId}`);

    interaction.followUp({embeds: [embed]}).catch(console.error);
  }
}

module.exports = {
  data: {
    name: "play",
    description: "Plays a requested video from Youtube",
    category: "music",
    options: [
      {
        name: "video",
        description: "The video to play",
        type: 3,
        required: true
      }
    ],
    examples: [
      "play meme compilation",
      "play ncs 1 hour",
      "play cheeeeeeeeese",
      "play something idk"
    ]
  },
  async execute(interaction, prefix, command, queue, botArgs = '', botCommand = false) {
    try {
      const [serverQueue, channel] = await check(interaction, queue, botCommand);
      if (!botCommand) await interaction.deferReply();
      if (botArgs) play(interaction, queue, serverQueue, channel, botArgs[0]);
      else play(interaction, queue, serverQueue, channel);
    } catch(err) {
      console.error(err);
      interaction.reply({content: 'An unknown error occured, please try again later', ephemeral: true});
    }
  }
}