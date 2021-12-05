import { slotMachine } from 'discord.js-games';
import { SlashCommandBuilder } from '@discordjs/builders';
import { economyFunctions } from '../../utils';
import { Command } from '../../types';

export const guildOnly: Command['guildOnly'] = true;

export const category: Command['category'] = 'Economy';

export const data: Command['data'] = new SlashCommandBuilder()
	.setName('slot-machine')
	.setDescription('Plays the slot machine')
	.addIntegerOption((option) =>
		option
			.setName('amount')
			.setDescription('The amount you want to bet')
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

			const win = await slotMachine({
				message: interaction,
				emojis: ['🤡', '🤤', '‼️', '⚡'],
				embed: {
					winMessage: `Congratulations, you won $${amount}!`,
					loseMessage: `Oops, you lost $${amount}`
				}
			}).catch(() => {});

			if (win) {
				economyFunctions.Guild.updateCash(user.ID, user.Cash + amount);
			} else {
				economyFunctions.Guild.updateCash(user.ID, user.Cash - amount);
			}
		}
	} catch (err) {
		console.error(err);
	}
};
