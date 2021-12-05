import { SlashCommandBuilder } from '@discordjs/builders';
import { ColorResolvable, CommandInteraction, MessageEmbed } from 'discord.js';
import { randomInt } from 'crypto';
import { Command } from '../../types';
import jsonFile from '../../json/8ball.json';

export const category: Command['category'] = 'Game Related';

export const data: Command['data'] = new SlashCommandBuilder()
	.setName('8ball')
	.setDescription('The magic 8-ball')
	.addStringOption((option) =>
		option
			.setName('text')
			.setDescription('Whatever you would wish to ask')
			.setRequired(false)
	);

export const execute: Command['execute'] = ({ interaction }) => {
	const input = (interaction as CommandInteraction).options.getString('text');
	const { color, value } = getRandomValue();

	const embed = new MessageEmbed()
		.setColor(color)
		.setAuthor(
			interaction.user.tag,
			interaction.user.displayAvatarURL({ dynamic: true })
		)
		.setTitle('Magic 8-Ball')
		.setTimestamp();

	if (input) {
		embed.setDescription(`Question: ${input}`);
		embed.addField('Output', `🎱 ${value}`);
	} else {
		embed.setDescription(`🎱 ${value}`);
	}

	interaction.reply({ embeds: [embed] }).catch(console.error);
};

function getRandomValue() {
	const random = jsonFile[randomInt(0, jsonFile.length)];

	let color: ColorResolvable;
	if (random.type === 1) color = 'DARK_GREEN';
	else if (random.type === 2) color = 'YELLOW';
	else color = 'RED';

	return { color, value: random.value };
}
