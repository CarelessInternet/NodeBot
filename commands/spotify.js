const SpotifyWebAPI = require('spotify-web-api-node');
const spotifyAPI = new SpotifyWebAPI({
  clientId: process.env.spotifyClientID,
  clientSecret: process.env.spotifyClientSecret
});
const {MessageEmbed} = require('discord.js');

function getAccessToken() {
  return new Promise((resolve, reject) => {
    spotifyAPI.clientCredentialsGrant()
    .then(data => resolve(spotifyAPI.setAccessToken(data.body['access_token'])))
    .catch(err => reject(err));
  });
}

module.exports = {
  data: {
    name: "spotify",
    description: "Returns information about a song on Spotify",
    category: "utility",
    options: [
      {
        name: "artist",
        description: "The artist of the song",
        type: 3,
        required: true
      },
      {
        name: "title",
        description: "The title of the song",
        type: 3,
        required: true
      }
    ],
    examples: [
      "spotify KSI Domain",
      "spotify Grant Macdonald Ram Ranch 69",
      "spotify Halogen U Got That",
      "spotify Vicetone Astronomia"
    ]
  },
  async execute(interaction) {
    const artist = interaction.options.get('artist')?.value;
    const title = interaction.options.get('title')?.value;

    try {
      await getAccessToken();
      const data = await spotifyAPI.searchTracks(`artist:${artist} track:${title}`);
      if (!data.body.tracks.items[0]) return interaction.reply({content: 'No results found with those queries, try changing the query, like the artist if there are multiple artists, or the title', ephemeral: true});

      const info = data.body.tracks.items[0];
      const duration = {
        minutes: Math.floor(info.duration_ms / 60000),
        seconds: ((info.duration_ms % 60000) / 1000).toFixed(0)
      };
      const embed = new MessageEmbed()
      .setColor('RANDOM')
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

      interaction.reply({embeds: [embed]});
    } catch(err) {
      console.error(err);
      interaction.reply({
        content: 'Error occured whilst trying to receive data',
        ephemeral: true
      }).catch(console.error);
    }
  }
}