import { LoremIpsum } from 'lorem-ipsum';
import { MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from '../../types';

export const category: Command['category'] = 'Other';

export const data: Command['data'] = new SlashCommandBuilder()
	.setName('lorem')
	.setDescription('Spits out some lorem ipsum text');

export const execute: Command['execute'] = ({ interaction }) => {
	const text = new LoremIpsum({
		sentencesPerParagraph: {
			min: 4,
			max: 10
		},
		wordsPerSentence: {
			min: 10,
			max: 20
		}
	}).generateParagraphs(1);

	const embed = new MessageEmbed()
		.setColor('RANDOM')
		.setAuthor(
			interaction.user.tag,
			interaction.user.displayAvatarURL({ dynamic: true })
		)
		.setTitle('Lorem Ipsum')
		.setDescription(text)
		.setTimestamp();

	interaction.reply({ embeds: [embed] }).catch(console.error);
};
