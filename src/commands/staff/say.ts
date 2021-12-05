import { MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from '../../types';

export const guildOnly: Command['guildOnly'] = true;

export const category: Command['category'] = 'Staff';

export const data: Command['data'] = new SlashCommandBuilder()
	.setName('say')
	.setDescription('Makes the bot say what you type')
	.addStringOption((option) =>
		option
			.setName('input')
			.setDescription('The text you want me to say')
			.setRequired(true)
	);

export const execute: Command['execute'] = async ({ interaction }) => {
	if (interaction.isCommand()) {
		try {
			if (!interaction.memberPermissions!.has(['MANAGE_CHANNELS'])) {
				return interaction.reply({
					content:
						'You need the manage channels permission to run this command',
					ephemeral: true
				});
			}

			const input = interaction.options.getString('input')!;

			await interaction.reply({ content: 'Sending...', ephemeral: true });

			const embed = new MessageEmbed()
				.setColor('BLURPLE')
				.setAuthor(
					interaction.user.tag,
					interaction.user.displayAvatarURL({ dynamic: true })
				)
				.setDescription(input)
				.setTimestamp()
				.setFooter(`Sent using the send command`);

			await interaction.channel?.send({ embeds: [embed] });

			interaction.editReply({ content: 'Sent!' });
		} catch (err) {
			console.error(err);
		}
	}
};
