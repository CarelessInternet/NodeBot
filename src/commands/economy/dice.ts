import { dice } from 'discord.js-games';
import { SlashCommandBuilder } from '@discordjs/builders';
import { economyFunctions } from '../../utils';
import { Command } from '../../types';

export const guildOnly: Command['guildOnly'] = true;

export const category: Command['category'] = 'Economy';

export const data: Command['data'] = new SlashCommandBuilder()
	.setName('dice')
	.setDescription('Bet on a dice roll')
	.addIntegerOption((option) =>
		option
			.setName('amount')
			.setDescription('The amount you want to bet')
			.setRequired(true)
	)
	.addIntegerOption((option) =>
		option
			.setName('side')
			.setDescription('The side you want to bet on')
			.setRequired(true)
	)
	.addIntegerOption((option) =>
		option
			.setName('side2')
			.setDescription(
				'Optionally choose another side, receive double the money if you win, or lose the amount you bet'
			)
			.setRequired(false)
	);

export const execute: Command['execute'] = async ({ interaction }) => {
	try {
		if (interaction.isCommand()) {
			const [amount, side, side2] = [
				interaction.options.getInteger('amount')!,
				interaction.options.getInteger('side')!,
				interaction.options.getInteger('side2')
			];

			const user = await economyFunctions.handleUser(interaction);
			const validate = await economyFunctions.Commands.validateCash(
				interaction,
				user,
				amount
			);

			if (validate) {
				return interaction.reply(validate);
			}

			const win = await dice({
				message: interaction,
				diceEmojis: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣'],
				dice: side2 ? [side, side2] : [side],
				embed: {
					winMessage: side2
						? `{roll1} & {roll2}, and {dice1} & {dice2}, you won $${amount}!`
						: `{roll1} and {dice1}, you won $${amount}!`,
					loseMessage: side2
						? `{roll1} & {roll2}, and {dice1} & {dice2}, you lost $${amount}`
						: `{roll1} and {dice1}, you lost $${amount}`
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
