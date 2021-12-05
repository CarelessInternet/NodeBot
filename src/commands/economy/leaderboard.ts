import { MessageEmbed } from 'discord.js';
import {
	memberNicknameMention,
	SlashCommandBuilder
} from '@discordjs/builders';
import { economyFunctions } from '../../utils';
import { Command } from '../../types';

export const guildOnly: Command['guildOnly'] = true;

export const category: Command['category'] = 'Economy';

export const data: Command['data'] = new SlashCommandBuilder()
	.setName('leaderboard')
	.setDescription('Displays the economy leaderboard of the server');

export const execute: Command['execute'] = async ({ interaction }) => {
	try {
		await economyFunctions.handleUser(interaction);
		const guildMembers = await economyFunctions.Guild.guildList(
			interaction.guildId
		);

		guildMembers.sort((a, b) => {
			if (a.Cash + a.Bank < b.Cash + b.Bank) {
				return 1;
			} else if (a.Cash + a.Bank > b.Cash + b.Bank) {
				return -1;
			} else {
				return 0;
			}
		});

		const embed = new MessageEmbed()
			.setColor('RANDOM')
			.setTitle(`${interaction.guild!.name} Leaderboard`)
			.setDescription(
				`💰 The current economy leaderboard of ${interaction.guild!.name}`
			)
			.setTimestamp()
			.setFooter('This command only displays the top 5 users');

		for (let i = 0; i < guildMembers.length; i++) {
			const user = guildMembers[i];

			embed.addField(
				`${i + 1}:`,
				`${memberNicknameMention(
					user.UserID
				)}\n💵 Cash: ${user.Cash.toLocaleString()}\n💸 Bank: ${user.Bank.toLocaleString()}`
			);
		}

		interaction.reply({ embeds: [embed] });
	} catch (err) {
		console.error(err);
	}
};
