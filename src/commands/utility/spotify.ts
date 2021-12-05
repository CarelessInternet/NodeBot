import SpotifyWebAPI from 'spotify-web-api-node';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { SlashCommandBuilder, time } from '@discordjs/builders';
import { capitalize } from '../../utils';
import { Command } from '../../types';

const spotifyAPI = new SpotifyWebAPI({
	clientId: process.env.SPOTIFY_CLIENT_ID,
	clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

export const category: Command['category'] = 'Utility';

export const data: Command['data'] = new SlashCommandBuilder()
	.setName('spotify')
	.setDescription('Returns information about a song on Spotify')
	.addStringOption((option) =>
		option
			.setName('artist')
			.setDescription('The artist of the song')
			.setRequired(true)
	)
	.addStringOption((option) =>
		option
			.setName('title')
			.setDescription('The title of the song')
			.setRequired(true)
	);

export const execute: Command['execute'] = async ({ interaction }) => {
	try {
		const clientCredentialsData = await spotifyAPI.clientCredentialsGrant();
		spotifyAPI.setAccessToken(clientCredentialsData.body.access_token);

		const [artist, title] = [
			(interaction as CommandInteraction).options.getString('artist'),
			(interaction as CommandInteraction).options.getString('title')
		];

		const data = await spotifyAPI.searchTracks(
			`artist:${artist} track:${title}`
		);

		if (!data.body.tracks?.items.length) {
			return interaction.reply({
				content: 'No results found with those queries',
				ephemeral: true
			});
		}

		const info = data.body.tracks.items[0];
		const duration = {
			minutes: Math.floor(info.duration_ms / 60000),
			seconds: parseFloat(((info.duration_ms % 60000) / 1000).toFixed(0))
		};

		const embed = new MessageEmbed()
			.setColor('DARK_GREEN')
			.setAuthor(
				interaction.user.tag,
				interaction.user.displayAvatarURL({ dynamic: true })
			)
			.setTitle(`${info.album.artists[0].name} - ${info.name}`)
			.setURL(info.external_urls.spotify)
			.addField(
				'Duration',
				`${duration.minutes}:${duration.seconds < 10 ? '0' : ''}${
					duration.seconds
				}`,
				true
			)
			.addField(
				'Release Date',
				time(new Date(info.album.release_date), 'R'),
				true
			)
			.addField('Album', info.album.name, true)
			.setThumbnail(info.album.images[1].url)
			.setTimestamp()
			.setFooter(`Explicit: ${capitalize(info.explicit.toString())}`);

		interaction.reply({ embeds: [embed] });
	} catch (err) {
		console.error(err);
	}
};
