import qrcode from 'qrcode';
import { Message, MessageAttachment, MessageEmbed } from 'discord.js';
import { hyperlink, SlashCommandBuilder } from '@discordjs/builders';
import { Command } from '../../types';

export const category: Command['category'] = 'Utility';

export const data: Command['data'] = new SlashCommandBuilder()
	.setName('qrcode')
	.setDescription('Takes some input and converts it into a QR code')
	.addStringOption((option) =>
		option
			.setName('input')
			.setDescription('The input you want to turn into a QR code')
			.setRequired(true)
	);

export const execute: Command['execute'] = async ({ interaction }) => {
	try {
		let input = '';

		if (interaction.isCommand()) {
			input = interaction.options.getString('input')!;
		} else if (interaction.isContextMenu()) {
			input = interaction.options.getMessage('message')!.content;
		} else {
			input = 'Missing input';
		}

		const buffer = await qrcode.toBuffer(input);
		const attachment = new MessageAttachment(buffer, 'qrcode.png');

		const embed = new MessageEmbed()
			.setColor('RANDOM')
			.setAuthor(
				interaction.user.tag,
				interaction.user.displayAvatarURL({ dynamic: true })
			)
			.setTitle('QR Code')
			.setImage('attachment://qrcode.png')
			.setTimestamp();

		if (interaction.isContextMenu()) {
			const { url } = interaction.options.getMessage('message') as Message;
			embed.setDescription(hyperlink('Original Message', url));
		}

		interaction.reply({ embeds: [embed], files: [attachment] });
	} catch (err) {
		console.error(err);
	}
};
