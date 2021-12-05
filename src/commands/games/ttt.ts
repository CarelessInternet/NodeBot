import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from '../../types';

export const category: Command['category'] = 'Game Related';

export const data: Command['data'] = new SlashCommandBuilder()
	.setName('ttt')
	.setDescription('Plays a game of tic tac toe')
	.addUserOption((option) =>
		option
			.setName('opponent')
			.setDescription('The user you want to play against')
			.setRequired(false)
	);

export const execute: Command['execute'] = ({ interaction }) => {
	interaction
		.reply({ content: 'Tic tac toe is currently unavailable', ephemeral: true })
		.catch(console.error);
};
