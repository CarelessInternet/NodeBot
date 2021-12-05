import fetch from 'node-fetch';
import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed, CommandInteraction } from 'discord.js';
import { Command } from '../../types';

export const category: Command['category'] = 'Game Related';

export const data: Command['data'] = new SlashCommandBuilder()
	.setName('csgo')
	.setDescription(
		'Returns CS:GO stats of a player. Use the Steam ID, and profile must be public'
	)
	.addStringOption((option) =>
		option
			.setName('id')
			.setDescription(
				'The Steam ID, the last part of the URL when looking at a steam profile'
			)
			.setRequired(true)
	);

export const execute: Command['execute'] = async ({ interaction }) => {
	try {
		await interaction.deferReply();

		const arg = (interaction as CommandInteraction).options.getString('id')!;
		const id = encodeURIComponent(arg);
		const profile = await fetch(
			`https://public-api.tracker.gg/v2/csgo/standard/profile/steam/${id}`,
			{
				method: 'get',
				headers: {
					'TRN-Api-Key': process.env.TRACKER_GG_API_KEY
				}
			}
		).then((res) => res.json());

		if (profile.errors) throw profile.errors[0].message;

		const platform = profile.data.platformInfo;
		const stats = profile.data.segments[0].stats;
		const embed = new MessageEmbed()
			.setColor('RANDOM')
			.setTitle(`${platform.platformUserHandle}'s CS:GO Stats`)
			.setDescription('All useful stats that you want to see')
			.addFields(
				getInfo(stats.timePlayed),
				getInfo(stats.moneyEarned),
				getInfo(stats.score),
				{ name: '\u200B', value: '\u200B' },
				getInfo(stats.kd, true),
				getInfo(stats.kills, true),
				getInfo(stats.wlPercentage, true),
				getInfo(stats.mvp, true),
				getInfo(stats.headshots, true),
				getInfo(stats.damage, true)
			)
			.setThumbnail(platform.avatarUrl)
			.setTimestamp()
			.setFooter(`Steam User ID: ${platform.platformUserId}`);

		interaction.reply({ embeds: [embed] }).catch(console.error);
	} catch (err) {
		console.error(err);

		const error = `An unknown error occured, try again later:\n${err}`;
		if (interaction.deferred) {
			interaction.editReply({ content: error });
		} else {
			interaction.reply({ content: error, ephemeral: true });
		}
	}
};

function getInfo(
	stat: { displayName: string; displayValue: string; percentile: number },
	top = false
) {
	// example: K/D (new line) 1.31 (new line) Top 17%
	return {
		inline: true,
		name: stat.displayName,
		value: top
			? `**${stat.displayValue}**\nTop ${Math.ceil(100 - stat.percentile)}%`
			: stat.displayValue
	};
}
