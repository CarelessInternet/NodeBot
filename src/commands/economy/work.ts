import work from '../../json/work.json';
import { randomInt } from 'crypto';
import { MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { economyFunctions } from '../../utils';
import { Command } from '../../types';

export const guildOnly: Command['guildOnly'] = true;

export const category: Command['category'] = 'Economy';

export const data: Command['data'] = new SlashCommandBuilder()
	.setName('work')
	.setDescription('Effortlessly earn some fictional money');

export const execute: Command['execute'] = async ({ interaction }) => {
	try {
		const user = await economyFunctions.handleUser(interaction);

		const amount = randomInt(201) + 300;
		const random = work[randomInt(work.length)];
		const message = random.replace(/{amount}/, amount.toLocaleString());

		await economyFunctions.Guild.updateCash(user.ID, user.Cash + amount);

		const embed = new MessageEmbed()
			.setColor('RANDOM')
			.setTitle('Work')
			.setDescription(message)
			.setTimestamp();

		interaction.reply({ embeds: [embed] });
	} catch (err) {
		console.error(err);
	}
};
