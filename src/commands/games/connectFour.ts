import { connectFour } from 'discord.js-games';
import { GuildMember } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from '../../types';

export const category: Command['category'] = 'Game Related';

export const data: Command['data'] = new SlashCommandBuilder()
	.setName('connect-four')
	.setDescription('Plays a game of connect four')
	.addUserOption((option) =>
		option
			.setName('user')
			.setDescription('The user you want to play against')
			.setRequired(false)
	);

export const execute: Command['execute'] = ({ interaction }) => {
	const opponent = interaction.options.getMember('user') as GuildMember | null;

	connectFour({
		message: interaction,
		...(opponent && { opponent })
	}).catch(() => {});
};
