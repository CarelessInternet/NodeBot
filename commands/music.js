// i have no idea what this code is tbh, bunch of random shit from stackoverflow and tutorials added together into a mess
// here is the tutorial video i looked at: https://www.youtube.com/watch?v=riyHsgI2IDs
const ytdl = require('ytdl-core'),
ytSearch = require('yt-search'),
fs = require('fs'),
queue = new Map();

module.exports = {
  name: 'music',
  description: fs.readFileSync('./txt/music.txt', 'utf8'),
  async execute(msg, args, command, botCommand = false) {
    const voiceChannel = msg.member.voice.channel,
    server_queue = queue.get(msg.guild.id),
    permissionsCheck = () => {
      return msg.member.roles.cache.some(role => role.name.toLowerCase() == 'dj') || msg.member.permissions.has('MANAGE_CHANNELS') || msg.member.permissions.has('ADMINISTRATOR');
    };
    // if the user isnt in a voice channel and the video is requested by a bot command, don't play video
    if (!voiceChannel && botCommand) return;
    if (!voiceChannel) return await msg.reply('You must be in a voice channel');
    if (msg.guild.voiceConnection && msg.member.voice.channelID !== msg.guild.voice.channelID) return await msg.reply('You must be in the same voice channel as the bot');
    if (!permissionsCheck() && botCommand) return;
    if (!permissionsCheck()) return await msg.reply('You must be administrator, have the DJ role or manage channels permission to run music commands');
    if (msg.member.voice.selfDeaf || msg.member.voice.serverDeaf) return await msg.reply('You must be undeafened to use music commmands');

    switch (command) {
      case 'play':
        await play(msg, args, voiceChannel, server_queue);
        break;
      case 'queue':
        await getQueue(msg, server_queue);
        break;
      case 'skip':
        await skip(msg, server_queue);
        break;
      case 'remove':
        await remove(msg, server_queue, args);
        break;
      case 'loop':
        await loop(msg, server_queue);
        break;
      case 'unloop':
        await unloop(msg, server_queue);
        break;
      case 'pause':
        await pause(msg, server_queue);
        break;
      case 'resume':
        await resume(msg, server_queue);
        break;
      case 'unpause':
        await resume(msg, server_queue);
        break;
      case 'volume':
        await volume(msg, server_queue, args);
        break;
      case 'leave':
        await leave(msg, server_queue);
        break;
      default:
        break;
    }
  }
};
async function play(msg, args, voiceChannel, server_queue) {
  if (!args.length) return await msg.reply('Enter a video to play');

  const videoFinder = async query => {
    let videoResult = await ytSearch(query);
    return (videoResult.videos.length > 0) ? videoResult.videos[0] : null;
  },
  video = await videoFinder(args.join(' '));
  if (!video) return await msg.channel.send('No video results found');
  if (video.duration.seconds > 10800) return await msg.channel.send('Video cannot be longer than 3 hours');
  
  const details = {
    title: video.title,
    url: video.url,
    timestamp: video.duration.timestamp,
    length: video.duration.seconds
  };

  if (!server_queue) {
    const queue_constructor = {
      voiceChannel: voiceChannel,
      textChannel: msg.channel,
      connection: null,
      volume: 0.1,
      loop: {
        value: false,
        msgSent: false
      },
      queue: []
    };

    queue.set(msg.guild.id, queue_constructor);
    queue_constructor.queue.push(details);
    
    try {
      const connection = await voiceChannel.join();
      queue_constructor.connection = connection;
      queue_constructor.connection.on('disconnect', () => queue.delete(msg.guild.id));
      await videoPlayer(msg.guild, queue_constructor.queue[0]);
    } catch(err) {
      await queue.get(msg.guild.id).voiceChannel.leave();
      await msg.channel.send('There was an error creating a connection, please try again later');
      queue.delete(msg.guild.id);
      console.error(err);
    }
  } else {
    server_queue.queue.push(details);
    return await msg.channel.send(`:thumbsup: Video added to queue: **${details.title}**, length: **${details.timestamp}**`);
  }
}
async function videoPlayer(guild, video) {
  const songQueue = queue.get(guild.id);
  if (video) {
    const stream = await ytdl(video.url, {filter: 'audioonly', quality: 'highestaudio', highWaterMark: 1 << 25});
    songQueue.connection.play(stream, {seek: 0, volume: songQueue.volume})
    .on('finish', async () => {
      if (songQueue.loop.value) {
        await videoPlayer(guild, songQueue.queue[0]);
      } else {
        songQueue.queue.shift();
        await videoPlayer(guild, songQueue.queue[0]);
      }
    })
    .on('error', console.error);

    if (!songQueue.loop.value || (songQueue.loop.value && !songQueue.loop.msgSent))
      await songQueue.textChannel.send(`:ear: Now playing video: **${video.title}**, length: **${video.timestamp}**`);
  } else {
    queue.delete(guild.id);
    await songQueue.voiceChannel.leave();
  }
}

async function getQueue(msg, server_queue) {
  if (!server_queue) return;
  var string = '';
  for (let i = 0; i < server_queue.queue.length; i++) {
    if (string.length > 2000) {
      string = string.substr(0, 2000);
      break;
    }
    string += `${i + 1}: ${server_queue.queue[i].title}${i != server_queue.queue.length - 1 ? '\n' : ''}`;
  }
  await msg.channel.send(string);
}

async function skip(msg, server_queue) {
  if (!msg.guild.me.voice.channel) return await msg.channel.send('I\'m not in a voice channel');
  if (!server_queue) return await msg.channel.send('No videos in queue');
  await server_queue.connection.dispatcher?.end();
}

async function remove(msg, server_queue, args) {
  if (!msg.guild.me.voice.channel) return await msg.channel.send('I\'m not in a voice channel');
  if (!server_queue) return await msg.channel.send('No videos in queue');
  if (!args[0]) return await msg.reply('Missing the video to remove');
  if (isNaN(args[0]) || !Number.isInteger(Number(args[0]))) return await msg.reply('Must be an integer, use the number next to the video\'s title in the queue function as the parameter');
  const arg = Number(args[0]) - 1;
  if (typeof server_queue.queue[arg] == 'undefined') return await msg.reply('Cannot find the specified video to remove in the queue');
  await msg.channel.send(`Removed the following video: ${server_queue.queue[arg].title}`);
  if (server_queue.queue.length == 1 && server_queue.queue.length == arg + 1)
    await skip(msg, server_queue);
  else
    await server_queue.queue.splice(arg, arg);
}

async function loop(msg, server_queue) {
  if (!server_queue) return;
  server_queue.loop.value = true;
  server_queue.loop.msgSent = true;
  await msg.channel.send(':repeat: Loop is now on');
}

async function unloop(msg, server_queue) {
  if (!server_queue) return;
  server_queue.loop.value = false;
  server_queue.loop.msgSent = false;
  await msg.channel.send(':repeat: Loop is now off');
}

async function pause(msg, server_queue) {
  if (!server_queue) return;
  await server_queue.connection.dispatcher?.pause();
  await msg.channel.send(':pause_button: Paused video');
}

async function resume(msg, server_queue) {
  if (!server_queue) return;
  if (!server_queue.connection.dispatcher?.paused) return;
  await server_queue.connection.dispatcher.resume();
  await msg.channel.send(':arrow_forward: Resuming video');
}

async function volume(msg, server_queue, args) {
  if (!server_queue) return;
  if (!args[0]) return await msg.reply('Give a volume number, from 0 to 2');
  if (isNaN(args[0]) || (Number(args[0]) > 2 && Number(args[0]) < 0)) return await msg.reply('Must be a number and be in between 0 and 2, default is 0.1');
  server_queue.volume = Number(args[0]);
  await server_queue.connection.dispatcher?.setVolume(server_queue.volume);
  await msg.channel.send(`:sound: Changed volume to ${Number(args[0])}`);
}

async function leave(msg, server_queue) {
  if (!msg.guild.voiceChannel && !queue.get(msg.guild.id)) return;
  await server_queue.voiceChannel.leave();
  await msg.channel.send(':skull_crossbones: Gone from voice channel');
}