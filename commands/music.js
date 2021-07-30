// if youre wondering what this code is, idk either please help
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
const fs = require('fs');
const randomHexColor = require('random-hex-color');
const {MessageEmbed} = require('discord.js');
const {joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus} = require('@discordjs/voice');
const queue = new Map();

// return undefined if no result, return video if result
async function videoFinder(query) {
  const videoResult = await ytSearch(query);
  return videoResult.videos?.[0];
}
// prepares video before calling the video player function
async function play(msg, serverQueue, args, channel) {
  if (!args[0]) return msg.reply('Enter a video to play').catch(console.error);

  const video = await videoFinder(args.join(' '));
  if (!video) return msg.reply('No search result found').catch(console.error);
  if (video.duration.seconds > 10800) return msg.reply('Video cannot be longer than 3 hours').catch(console.error);

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

    // add the info to a map/hashmap with the key as the guild id
    queue.set(msg.guild.id, constructor);
    constructor.queue.push(video);

    try {
      // idk what adapterCreator is but whatever it's required
      const connection = await joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator
      });

      constructor.connection = connection;
      constructor.connection.on(VoiceConnectionStatus.Disconnected, () => queue.delete(msg.guild.id));
      constructor.connection.on(VoiceConnectionStatus.Destroyed, () => queue.delete(msg.guild.id));
      constructor.connection.on('error', console.error);

      videoPlayer(msg, constructor);
    } catch(err) {
      // dsetroy connection if error
      console.error(err);
      queue.get(msg.guild.id).connection.destroy();

      msg.reply('There was an error creating a connection, please try again later').catch(console.error);
    }
  } else {
    // if there is a server queue, add the video to the queue
    serverQueue.queue.push(video);
    msg.reply(`👍 Video added to queue: ***${video.title}***, length: **${video.duration.timestamp}**`).catch(console.error);
  }
}
// the function that actually plays the video
async function videoPlayer(msg, constructor) {
  const songQueue = constructor.queue[0];
  if (!songQueue) return constructor.connection.destroy();

  // create connection and play it
  const resource = await createAudioResource(ytdl(songQueue.url, {filter: 'audioonly', quality: 'highestaudio', highWaterMark: 1 << 25}), {inlineVolume: true});
  const player = createAudioPlayer();
  const connection = constructor.connection;
  
  resource.volume.setVolume(constructor.volume);
  player.play(resource);
  connection.subscribe(player);
  constructor.resource = resource;
  constructor.player = player;

  // equivalent to on finish event
  player.on(AudioPlayerStatus.Idle, () => {
    // if there is a loop, replay video, otherwise delete video and move on to next one
    if (constructor.loop) return videoPlayer(msg, constructor);
    constructor.queue.shift();
    videoPlayer(msg, constructor);
  });
  player.on('error', console.error);

  // if no loop, or loop message has already been sent, send data about video about to be played
  if (!constructor.loop) {
    const embed = new MessageEmbed()
    .setColor(randomHexColor())
    .setTitle(songQueue.title)
    .setURL(songQueue.url)
    .setAuthor(songQueue.author.name)
    .setDescription(songQueue.description)
    .setThumbnail(songQueue.thumbnail)
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

    msg.channel.send({embeds: [embed]}).catch(console.error);
  }
}
// show queue
function getQueue(msg, constructor) {
  if (!constructor) return;
  const embed = new MessageEmbed()
  .setColor(randomHexColor())
  .setDescription(`${msg.guild.name}${msg.guild.name.toLowerCase().endsWith('s') ? '\'' : '\'s'} Queue`)
  .setTitle('Video Queue')
  .setImage(constructor.queue[0].image)
  .setTimestamp();

  constructor.queue.forEach((val, index) => {
    embed.addField(`${(index + 1).toString()}:`, val.title);
  });
  msg.reply({embeds: [embed]}).catch(console.error);
}
// skips current video
function skip(msg, constructor) {
  if (!constructor) return msg.reply('No videos to skip in the queue').catch(console.error);
  constructor.player.stop();
}
// removes video from queue
function remove(msg, constructor, args) {
  if (!constructor) return msg.reply('No videos to remove in the queue').catch(console.error);
  if (!args[0]) return msg.reply('Missing the video to remove').catch(console.error);
  if (isNaN(args[0])) return msg.reply('The video to remove must be an integer, use the number above the video\'s title as the video to remove').catch(console.error);
  const num = parseInt(args[0]) - 1;

  if (!constructor.queue[num]) return msg.reply('Cannot find the video to remove').catch(console.error);
  const embed = new MessageEmbed()
  .setColor(randomHexColor())
  .setTitle('Removing the following video:')
  .setDescription(`${constructor.queue[num].title} by ${constructor.queue[num].author.name}`)
  .setImage(constructor.queue[num].image)
  .setTimestamp();
  msg.reply({embeds: [embed]}).catch(console.error);

  // if num is the first item in the array
  if (num == 0) skip(msg, constructor);
  else constructor.queue.splice(num, num);
}
// loop the current video
function loop(msg, constructor) {
  if (!constructor) return msg.reply('No video to loop').catch(console.error);
  constructor.loop = true;
  msg.reply('🔁 Loop is now on').catch(console.error);
}
// unloop the current video
function unloop(msg, constructor) {
  if (!constructor) return msg.reply('No video to unloop').catch(console.error);
  constructor.loop = false;
  msg.reply('🔁 Loop is now off').catch(console.error);
}
// pauses current video
function pause(msg, constructor) {
  if (!constructor) return msg.reply('No video to pause').catch(console.error);
  constructor.player.pause();
  msg.reply('⏸️ Paused video').catch(console.error);
}
// resumes current video
function resume(msg, constructor) {
  if (!constructor) return msg.reply('No video to resume').catch(console.error);
  constructor.player.unpause();
  msg.reply('▶️ Resuming video').catch(console.error);
}
// changes volume
function volume(msg, constructor, args) {
  if (!constructor) return msg.reply('No video to change volume to').catch(console.error);
  if (!args[0]) return msg.reply('Give a volume number, between 0 and 2').catch(console.error);
  if (isNaN(args[0])) return msg.reply('Volume must be a number').catch(console.error);
  const num = parseFloat(args[0]);

  if (num > 2 || num < 0) return msg.reply('Volume must be between 0 and 2').catch(console.error);
  constructor.volume = num;
  constructor.resource.volume.setVolume(num);
  msg.reply(`${num > 1 ? '🔊' : '🔉'} Volume changed to ${num}`).catch(console.error);
}
// leaves voice channel
function leave(msg, constructor) {
  constructor.connection.destroy();
  msg.channel.send('☠️ Disconnected from voice channel').catch(console.error);
}

// check for dj role or manage channels permission
function checkForPermissions(member) {
  return member.roles.cache.some(role => role.name.toLowerCase() === 'dj' || member.permissions.has('MANAGE_CHANNELS'));
}

module.exports = {
  name: 'music',
  description: fs.readFileSync('./txt/music.txt', 'utf8'),
  execute(msg, args, command, botCommand = false) {
    const channel = msg.member?.voice.channel;
    const serverQueue = queue.get(msg.guild.id);

    // if video is requested by bot and user isnt in a voice channel/has no permission, dont send a message
    if ((!channel && botCommand) || (!checkForPermissions(msg.member) && botCommand)) return;
    if (!channel) return msg.reply('You must be in a voice channel to use music commands').catch(console.error);

    if (msg.guild.me.voice?.channelId && msg.member.voice.channelId !== msg.guild.me.voice.channelId) return msg.reply('You must be in the same voice channel as the bot').catch(console.error);
    if (!checkForPermissions(msg.member)) return msg.reply('You must have the DJ role or manage channels permission to use music commands').catch(console.error);
    if (msg.member.selfDeaf || msg.member.serverDeaf) return msg.reply('You must be undeafened to use music commands');

    switch (command) {
      case 'play':
        return play(msg, serverQueue, args, channel);
      case 'queue':
        return getQueue(msg, serverQueue);
      case 'skip':
        return skip(msg, serverQueue);
      case 'remove':
        return remove(msg, serverQueue, args);
      case 'loop':
        return loop(msg, serverQueue);
      case 'unloop':
        return unloop(msg, serverQueue);
      case 'pause':
        return pause(msg, serverQueue);
      case 'unpause':
        return resume(msg, serverQueue);
      case 'resume':
        return resume(msg, serverQueue);
      case 'volume':
        return volume(msg, serverQueue, args);
      case 'leave':
        return leave(msg, serverQueue);
      default:
        break;
    }
  }
}