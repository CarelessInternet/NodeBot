const search = require('youtube-search');
const secondarySearch = require('yt-search');
const ytdl = require('ytdl-core');
const {MessageEmbed} = require('discord.js');
const {joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus} = require('@discordjs/voice');
const queue = new Map();

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
          url: videoDetails['channel_url']
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
async function play(interaction, serverQueue, channel, botArg = '') {
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
// show queue
function getQueue(interaction, constructor) {
  if (!constructor) return;
  const embed = new MessageEmbed()
  .setColor('RANDOM')
  .setDescription(`${interaction.guild.name}${interaction.guild.name.toLowerCase().endsWith('s') ? '\'' : '\'s'} Queue`)
  .setTitle('Video Queue')
  .setImage(constructor.queue[0].image)
  .setTimestamp();

  constructor.queue.forEach((val, index) => {
    embed.addField(`${(index + 1).toString()}:`, val.title);
  });
  interaction.reply({embeds: [embed]}).catch(console.error);
}
// skips current video
async function skip(interaction, constructor) {
  await interaction.deferReply().catch(console.error);

  if (!constructor) return interaction.followUp({content: 'No videos to skip in the queue'}).catch(console.error);
  interaction.followUp({content: 'Skipping video...'});
  constructor.player.stop();
}
// removes video from queue
function remove(interaction, constructor) {
  if (!constructor) return interaction.reply({content: 'No videos to remove in the queue', ephemeral: true}).catch(console.error);
  const arg = interaction.options.get('index')?.value;
  const num = arg - 1;

  if (!constructor.queue[num]) return interaction.reply({content: 'Cannot find the video to remove', ephemeral: true}).catch(console.error);
  if (num === 0) return skip(interaction, constructor);
  const embed = new MessageEmbed()
  .setColor('RANDOM')
  .setTitle('Removing the following video:')
  .setDescription(`${constructor.queue[num].title} by ${constructor.queue[num].author.name}`)
  .setImage(constructor.queue[num].image)
  .setTimestamp();

  constructor.queue.splice(num, num);
  interaction.reply({embeds: [embed]}).catch(console.error);
}
// loop the current video
function loop(interaction, constructor) {
  if (!constructor) return interaction.reply({content: 'No video to loop', ephemeral: true}).catch(console.error);
  constructor.loop = true;
  interaction.reply({content: '🔁 Loop is now on'}).catch(console.error);
}
// unloop the current video
function unloop(interaction, constructor) {
  if (!constructor) return interaction.reply({content: 'No video to unloop', ephemeral: true}).catch(console.error);
  constructor.loop = false;
  interaction.reply({content: '🔁 Loop is now off'}).catch(console.error);
}
// pause current video
function pause(interaction, constructor) {
  if (!constructor) return interaction.reply({content: 'No video to pause', ephemeral: true}).catch(console.error);
  constructor.player.pause();
  interaction.reply({content: '⏸️ Paused video'}).catch(console.error);
}
// resume current video
function resume(interaction, constructor) {
  if (!constructor) return interaction.reply({content: 'No video to resume', ephemeral: true}).catch(console.error);
  constructor.player.unpause();
  interaction.reply({content: '▶️ Resumed video'}).catch(console.error);
}
// changes volume of the bot for the channel
function volume(interaction, constructor) {
  const arg = interaction.options.get('volume')?.value;
  if (!constructor) return interaction.reply({content: 'No video to change volume to', ephemeral: true}).catch(console.error);

  if (arg > 2 || arg < 0) return interaction.reply({content: 'Volume must be between 0 and 2', ephemeral: true}).catch(console.error);
  constructor.volume = arg;
  constructor.resource.volume.setVolume(arg);
  interaction.reply({content: `${arg > 1 ? '🔊' : '🔉'} Volume changed to ${arg}`}).catch(console.error);
}
// leaves voice channel
function leave(interaction, constructor) {
  interaction.editReply({content: 'Disconnecting...'}).catch(console.error);
  constructor.connection.destroy();
}

// check for dj role or manage channels permission
function checkForPermissions(member) {
  return member.roles.cache.some(role => role.name.toLowerCase() === 'dj' || member.permissions.has('MANAGE_CHANNELS'));
}

module.exports = {
  name: 'music',
  aliases: ['play', 'queue', 'skip', 'remove', 'loop', 'unloop', 'pause', 'unpause', 'resume', 'volume', 'leave'],
  async execute(interaction, prefix, command, botArgs = [], botCommand = false) {
    if (!interaction.inGuild() && botCommand) return;
    if (!interaction.inGuild()) return interaction.reply({content: 'Music commands are only available in a guild'}).catch(console.error);
    const channel = interaction.member?.voice.channel;
    const serverQueue = queue.get(interaction.guild.id);

    // if video is requested by bot and user isnt in a voice channel/has no permission, dont send a message
    if ((!channel && botCommand) || (!checkForPermissions(interaction.member) && botCommand)) return;
    if (!channel) return interaction.reply({content: 'You must be in a voice channel to use music commands', ephemeral: true}).catch(console.error);

    if (interaction.guild.me.voice?.channelId && channel.id !== interaction.guild.me.voice.channelId) return interaction.reply({content: 'You must be in the same voice channel as the bot', ephemeral: true}).catch(console.error);
    if (!checkForPermissions(interaction.member)) return interaction.reply({content: 'You must have the DJ role or manage channels permission to use music commands', ephemeral: true}).catch(console.error)
    if (interaction.member.voice.selfDeaf || interaction.member.voice.serverDeaf) return interaction.reply({content: 'You must be undeafened to use music commands', ephemeral: true}).catch(console.error);

    switch (command) {
      case 'play':
        if (!botCommand) await interaction.deferReply().catch(console.error);
        if (botArgs) return play(interaction, serverQueue, channel, botArgs[0]);
        else return play(interaction, serverQueue, channel);
      case 'queue':
        return getQueue(interaction, serverQueue);
      case 'skip':
        return skip(interaction, serverQueue);
      case 'remove':
        return remove(interaction, serverQueue);
      case 'loop':
        return loop(interaction, serverQueue);
      case 'unloop':
        return unloop(interaction, serverQueue);
      case 'pause':
        return pause(interaction, serverQueue);
      case 'unpause':
        return resume(interaction, serverQueue);
      case 'resume':
        return resume(interaction, serverQueue);
      case 'volume':
        return volume(interaction, serverQueue);
      case 'leave':
        await interaction.deferReply({ephemeral: true}).catch(console.error);
        return leave(interaction, serverQueue);
      default:
        break;
    }
  }
}