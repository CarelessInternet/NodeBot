import { SlashCommandBuilder } from '@discordjs/builders';
import { economyFunctions } from '../../utils';
import { Command } from '../../types';

export const guildOnly: Command['guildOnly'] = true;

export const category: Command['category'] = 'Economy';

export const data: Command['data'] = new SlashCommandBuilder()
	.setName('stats')
	.setDescription('Returns stats about your current economy');

export const execute: Command['execute'] = async ({ interaction }) => {
	try {
		await economyFunctions.handleUser(interaction);
		const reply = await economyFunctions.Guild.userStats(
			interaction.user,
			interaction.guildId
		);

		interaction.reply(reply);
	} catch (err) {
		console.error(err);
	}
};
