const SpotifyWebApi = require('spotify-web-api-node'),
spotifyApi = new SpotifyWebApi({
  clientId: process.env.spotifyClientID,
  clientSecret: process.env.spotifyClientSecret
});

module.exports = {
  name: 'spotify',
  description: 'Returns information about a song, please include both the artist and the title.',
  async execute(msg, args, Discord) {
    if (!args[0]) return await msg.reply('Missing the artist\'s name and/or the title of the song');
    if (args.join(' ').split(' - ').length < 2) return await msg.reply('Please include both the artist and the title, and make sure the syntax is correct');
    const arg = args.join(' ').split(' - '),
    artist = arg.shift(),
    title = arg.join(' - ');

    await spotifyApi.clientCredentialsGrant()
    .then(data => spotifyApi.setAccessToken(data.body['access_token']))
    .catch(err => console.log('spotify access token error:', err));
    
    await spotifyApi.searchTracks(`artist:${artist} track:${title}`)
    .then(async data => {
      if (!data.body.tracks.items[0]) return await msg.channel.send('No results found with those queries. If there are multiple artists in the song, trying changing the artist, and make sure you\'ve spelt everything correctly');
      const info = data.body.tracks.items[0],
      duration = {
        minutes: Math.floor(info.duration_ms / 60000),
        seconds: ((info.duration_ms % 60000) / 1000).toFixed(0)
      },
      embed = new Discord.MessageEmbed()
      .setColor('#1DB954')
      .setTitle(`${info.album.artists[0].name} - ${info.name}`)
      .addFields(
        {name: 'Duration', value: `${duration.minutes}:${duration.seconds < 10 ? '0' : ''}${duration.seconds}`, inline: false},
        {name: 'Release Date', value: info.album.release_date, inline: false},
        {name: 'Album', value: info.album.name, inline: false},
        {name: 'Explicit', value: info.explicit.toString().charAt(0).toUpperCase() + info.explicit.toString().slice(1), inline: false},
        {name: 'Link', value: info.external_urls.spotify, inline: false}
      )
      .setImage(info.album.images[1].url);

      await msg.channel.send(embed);
    }).catch(async err => {
      await msg.channel.send('Error occured while trying to send/receive the requested data');
    });
  }
}