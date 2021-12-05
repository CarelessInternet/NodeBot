import crime from '../../json/crime.json';
import { randomInt } from 'crypto';
import { MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { economyFunctions } from '../../utils';
import { Command } from '../../types';

export const guildOnly: Command['guildOnly'] = true;

export const category: Command['category'] = 'Economy';

export const data: Command['data'] = new SlashCommandBuilder()
	.setName('crime')
	.setDescription('You commit a fictional crime');

export const execute: Command['execute'] = async ({ interaction }) => {
	try {
		const user = await economyFunctions.handleUser(interaction);

		const luck = randomInt(2);
		const dollars = randomInt(500, 1001);
		const amount = luck === 0 ? dollars : -dollars;

		const random = crime[luck][randomInt(crime[luck].length)];
		const message = random.replace(/{amount}/, amount.toLocaleString());

		await economyFunctions.Guild.updateCash(user.ID, user.Cash + amount);

		const embed = new MessageEmbed()
			.setColor(luck === 0 ? 'GREEN' : 'RED')
			.setAuthor(
				interaction.user.tag,
				interaction.user.displayAvatarURL({ dynamic: true })
			)
			.setTitle('Crime')
			.setDescription(message)
			.setTimestamp()
			.setFooter('This is completely fictional');

		interaction.reply({ embeds: [embed] });
	} catch (err) {
		console.error(err);
	}
};
