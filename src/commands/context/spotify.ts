import SpotifyWebAPI from 'spotify-web-api-node';
import {
	ContextMenuCommandBuilder,
	memberNicknameMention,
	time
} from '@discordjs/builders';
import { ApplicationCommandType } from 'discord-api-types';
import { GuildMember, MessageEmbed } from 'discord.js';
import { capitalize } from '../../utils';
import { Command } from '../../types';

const spotifyAPI = new SpotifyWebAPI({
	clientId: process.env.SPOTIFY_CLIENT_ID,
	clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

export const category: Command['category'] = 'Context Menu';

export const data: Command['data'] = new ContextMenuCommandBuilder()
	.setName('Get Song Info')
	.setType(ApplicationCommandType.User);

export const execute: Command['execute'] = async ({ interaction }) => {
	const member = interaction.options.getMember('user') as GuildMember;

	if (!member.presence?.activities) {
		return interaction.reply({
			content: 'User does not have any presences',
			ephemeral: true
		});
	}

	const clientCredentialsData = await spotifyAPI.clientCredentialsGrant();
	spotifyAPI.setAccessToken(clientCredentialsData.body.access_token);

	const song = member.presence.activities.find((activity) => activity.syncId);

	if (!song) {
		return interaction.reply({
			content: 'User is not playing a song',
			ephemeral: true
		});
	}

	const { body: info } = await spotifyAPI.getTrack(song.syncId!);
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
		.setDescription(
			`${memberNicknameMention(member.id)}'s current playing song`
		)
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
};
