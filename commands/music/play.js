const ytdl = require('ytdl-core');
const ytsr = require('ytsr');
const {MessageEmbed} = require('discord.js');
const {joinVoiceChannel, createAudioPlayer, createAudioResource, entersState, AudioPlayerStatus, VoiceConnectionStatus} = require('@discordjs/voice');
const check = require('../../musicCheck');

// reject if no result, resolve with video if result
function videoFinder(query) {
  return new Promise(async (resolve, reject) => {
    try {
      const filters = await ytsr.getFilters(query);
      const {url} = filters.get('Type').get('Video');

      if (!url) reject('No video was found with that query (happens sometimes unfortunately)');
      const results = await ytsr(url, {pages: 1});

      resolve(results.items[0]);
    } catch(err) {
      reject(err);
    }
  });
}
// returns info about video
function returnVideoInformation(video) {
  const embed = new MessageEmbed()
  .setColor('RANDOM')
  .setTitle(video.title)
  .setURL(video.url)
  .setAuthor(video.author.name, video.author.bestAvatar.url, video.author.url)
  .setDescription(video.description ?? '')
  .addField('\u200B', '\u200B')
  .addField('Duration', video.duration, true)
  .addField('Views', video.views.toLocaleString(), true)
  .addField('Video ID', video.id, true)
  .setThumbnail(video.bestThumbnail.url)
  .setTimestamp();

  return embed;
}
// prepares video before calling the video player function
async function play(interaction, queue, serverQueue, channel, botArg = '') {
  try {
    const arg = interaction.options.getString('video') ?? botArg;
    const video = await videoFinder(arg);

    // if (duration in seconds is more than 10800 (3 hours))    
    if (video.duration.split(':').reduce((acc, time) => (60 * acc) + +time, 0) > 10800) return interaction.followUp({content: 'Video must be less than 3 hours long', ephemeral: true});

    if (!serverQueue) {
      // all necessary information needed for sending messages, setting up loops, queue system, etc
      const musicChannel = await interaction.guild.channels.fetch(interaction.channelId);
      const constructor = {
        queue: [],
        channel: musicChannel,
        volume: 1,
        player: null,
        resource: null,
        connection: null,
        loop: false
      };

      // identify each server with it's id
      queue.set(interaction.guildId, constructor);
      constructor.queue.push(video);

      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator
      });

      connection.on(VoiceConnectionStatus.Disconnected, async () => {
        try {
          // if all promises resolve, the client seems to be reconnecting to a new channel, else it seems to be a real disconnect
          await Promise.race([
            entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
            entersState(connection, VoiceConnectionStatus.Connecting, 5_000)
          ]);
        } catch(err) {
          if (connection.state.status !== VoiceConnectionStatus.Destroyed) connection.destroy();
        }
      });
      connection.on(VoiceConnectionStatus.Destroyed, async () => {
        const {channel: textChannel} = queue.get(interaction.guildId);
        queue.delete(interaction.guildId);

        textChannel.send({content: '☠️ Disconnected from voice channel'}).catch(console.error);
      });
      connection.on('error', console.error);

      const player = createAudioPlayer();

      // equivalent to an on finish event
      player.on(AudioPlayerStatus.Idle, () => {
        // if there is a loop, replay video, else delete video and move on to next one
        // destructuring loop from constructor doesnt work for some reason
        if (constructor.loop) return videoPlayer(interaction, constructor);

        constructor.queue.shift();
        videoPlayer(interaction, constructor);
      });
      player.on('error', console.error);

      constructor.connection = connection;
      constructor.player = player;
      videoPlayer(interaction, constructor);
    } else {
      serverQueue.queue.push(video);

      const embed = returnVideoInformation(video);
      interaction.followUp({content: '👍 Video added to queue:', embeds: [embed]});
    }
  } catch(err) {
    console.error(err);
    interaction.followUp({content: err ?? 'An unknown error occured, please try again later', ephemeral: true}).catch(console.error);
  }
}
// the function that actually plays the video
function videoPlayer(interaction, constructor) {
  const songQueue = constructor.queue[0];
  const {connection, channel, player} = constructor;
  if (!songQueue) return connection.destroy();

  try {
    // create audio resource & player, and play the video
    // we have to set quality to lowestaudio due to something about discord audio bitrate or something
    // more here: https://github.com/fent/node-ytdl-core/issues/994#issuecomment-912891183
    const video = ytdl(songQueue.url, {filter: 'audioonly', quality: 'lowestaudio', highWaterMark: 1 << 25});
    const resource = createAudioResource(video, {inlineVolume: true});

    resource.volume.setVolume(constructor.volume);
    player.play(resource);
    connection.subscribe(player);
    constructor.resource = resource;

    if (!constructor.loop) {
      const embed = returnVideoInformation(songQueue);

      if (!interaction.replied) interaction.followUp({embeds: [embed]});
      else channel.send({embeds: [embed]});
    }
  } catch(err) {
    console.error(err);
    connection.destroy();

    channel.send({content: 'An unknown error occured while doing something with the music\n' + err}).catch(console.error);
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
      // for some reason, using var lets the variables be used outside the try catch scope?? but not const or let????
      // and i have to put this code in try catch instead of await check.catch() because i get an intermediate value is not iterable error??
      var [serverQueue, channel] = await check(interaction, queue, botCommand);
    } catch(err) {
      return interaction.reply(err);
    }

    if (!botCommand) await interaction.deferReply().catch(console.error);
    if (botArgs) play(interaction, queue, serverQueue, channel, botArgs[0]);
    else play(interaction, queue, serverQueue, channel);
  }
}