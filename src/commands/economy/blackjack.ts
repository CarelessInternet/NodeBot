import { blackjack } from 'discord.js-games';
import { CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { economyFunctions } from '../../utils';
import { Command } from '../../types';

export const guildOnly: Command['guildOnly'] = true;

export const category: Command['category'] = 'Economy';

export const data: Command['data'] = new SlashCommandBuilder()
	.setName('blackjack')
	.setDescription('Plays a classic game of blackjack')
	.addIntegerOption((option) =>
		option
			.setName('amount')
			.setDescription('The amount of cash to bet')
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

			const result = await blackjack({
				message: interaction as CommandInteraction,
				embed: {
					winMessage: `🥳 You won against the dealer and got $${amount.toLocaleString()}!`,
					tieMessage: "🧐 It's a draw! No one wins",
					loseMessage: `😔 You lost the game and $${amount.toLocaleString()}`
				}
			}).catch(() => {});

			if (result === 'win') {
				economyFunctions.Guild.updateCash(user.ID, user.Cash + amount);
			} else if (result === 'loss') {
				economyFunctions.Guild.updateCash(user.ID, user.Cash - amount);
			}
		}
	} catch (err) {
		console.error(err);
	}
};
