const SpotifyWebApi = require('spotify-web-api-node');
const randomHexColor = require('random-hex-color');
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.spotifyClientID,
  clientSecret: process.env.spotifyClientSecret
});

function getAccessToken() {
  return new Promise((resolve, reject) => {
    spotifyApi.clientCredentialsGrant()
    .then(data => resolve(spotifyApi.setAccessToken(data.body['access_token'])))
    .catch(err => reject(err));
  });
}

module.exports = {
  name: 'spotify',
  description: 'Returns information about a song, please include both the artist and the title.',
  async execute(msg, args, Discord) {
    const arg = args.join(' ').split(' - ');
    if (arg.length < 2) return msg.reply('Please include both the artist and the title, and make sure the syntax is correct').catch(console.error);

    const artist = arg.shift();
    const title = arg.join(' - ');
    try {
      await getAccessToken();
      const data = await spotifyApi.searchTracks(`artist:${artist} track:${title}`);

      if (!data.body.tracks.items[0]) return msg.reply('No results found with those queries, try changing the query, like the artist if there are multiple artists, or the title').catch(console.error);
      const info = data.body.tracks.items[0];
      const duration = {
        minutes: Math.floor(info.duration_ms / 60000),
        seconds: ((info.duration_ms % 60000) / 1000).toFixed(0)
      };
      const embed = new Discord.MessageEmbed()
      .setColor(randomHexColor())
      .setTitle(`${info.album.artists[0].name} - ${info.name}`)
      .setImage(info.album.images[1].url)
      .addFields({
        name: 'Duration',
        value: `${duration.minutes}:${duration.seconds < 10 ? '0' : ''}${duration.seconds}`
      }, {
        name: 'Release Date',
        value: info.album.release_date
      }, {
        name: 'Album',
        value: info.album.name
      }, {
        name: 'Explicit',
        value: info.explicit.toString().charAt(0).toUpperCase() + info.explicit.toString().slice(1)
      }, {
        name: 'Link',
        value: info.external_urls.spotify
      })
      .setTimestamp()
      .setFooter('Sometimes the results might return a remix instead of the requested song, it just happens');

      msg.reply({embeds: [embed]}).catch(console.error);
    } catch(err) {
      console.error(err);
      msg.reply('Error occured whilst trying to receive data').catch(console.error);
    }
  }
};