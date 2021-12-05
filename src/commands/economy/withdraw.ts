import { SlashCommandBuilder } from '@discordjs/builders';
import { economyFunctions } from '../../utils';
import { Command } from '../../types';

export const guildOnly: Command['guildOnly'] = true;

export const category: Command['category'] = 'Economy';

export const data: Command['data'] = new SlashCommandBuilder()
	.setName('withdraw')
	.setDescription('Withdraw money from your bank')
	.addIntegerOption((option) =>
		option
			.setName('amount')
			.setDescription('The amount you want to withdraw')
			.setRequired(true)
	);

export const execute: Command['execute'] = async ({ interaction }) => {
	try {
		if (interaction.isCommand()) {
			const amount = interaction.options.getInteger('amount')!;
			const user = await economyFunctions.handleUser(interaction);
			const validate = await economyFunctions.Commands.validateCash(
				interaction,
				user,
				amount
			);

			if (validate) {
				return interaction.reply(validate);
			}

			await economyFunctions.Guild.updateBank(user.ID, user.Bank - amount);
			await economyFunctions.Guild.updateCash(user.ID, user.Cash - amount);

			const stats = await economyFunctions.Guild.userStats(
				interaction.user,
				interaction.guildId
			);
			stats.embeds![0].description = `💰 Successfully withdrew $${amount.toLocaleString()}`;

			interaction.reply(stats);
		}
	} catch (err) {
		console.error(err);
	}
};
