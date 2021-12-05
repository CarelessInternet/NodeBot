import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Message, MessageEmbed } from 'discord.js';
import { Command } from '../../types';

export const guildOnly: Command['guildOnly'] = true;

export const category: Command['category'] = 'Utility';

export const data: Command['data'] = new SlashCommandBuilder()
	.setName('poll')
	.setDescription('Creates a poll with votes as reactions')
	.addStringOption((option) =>
		option
			.setName('title')
			.setDescription('The title of the poll')
			.setRequired(true)
	)
	.addNumberOption((option) =>
		option
			.setName('hours')
			.setDescription('The amount of hours the poll should last')
			.setRequired(true)
	)
	.addStringOption((option) =>
		option
			.setName('field1')
			.setDescription('An option in the poll')
			.setRequired(true)
	)
	.addStringOption((option) =>
		option
			.setName('field2')
			.setDescription('An option in the poll')
			.setRequired(false)
	)
	.addStringOption((option) =>
		option
			.setName('field3')
			.setDescription('An option in the poll')
			.setRequired(false)
	)
	.addStringOption((option) =>
		option
			.setName('field4')
			.setDescription('An option in the poll')
			.setRequired(false)
	);

export const execute: Command['execute'] = async ({ interaction }) => {
	try {
		const options = (interaction as CommandInteraction).options;
		const [title, hours] = [
			options.getString('title')!,
			options.getNumber('hours')!
		];
		const fields = [
			options.getString('field1')!,
			options.getString('field2'),
			options.getString('field3'),
			options.getString('field4')
		].filter((field) => field !== null);

		if (hours > 24 * 7) {
			return interaction.reply({
				content: 'Hours cannot be longer than 7 days',
				ephemeral: true
			});
		}

		await interaction.reply({ content: 'Creating poll...', ephemeral: true });

		const embed = new MessageEmbed()
			.setColor('RANDOM')
			.setTitle(title)
			.setDescription('Choose an option:')
			.setTimestamp()
			.setFooter(
				`Duration of poll: ${hours} ${hours === 1 ? 'hour' : 'hours'}`
			);

		for (const [index, field] of fields.entries()) {
			if (field) {
				embed.addField(`${index + 1}:`, field);
			}
		}

		const message = (await interaction.channel?.send({
			embeds: [embed]
		})) as Message;

		const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];

		for await (const index of fields.keys()) {
			message.react(emojis[index]);
		}

		interaction.editReply({ content: 'Poll created!' });

		const collector = message.createReactionCollector({
			time: hours * 60 * 60 * 1000
		});

		collector.on('end', (collected, reason) => {
			switch (reason) {
				case 'time': {
					embed.setDescription(
						`Amount of votes: ${
							// client votes is counted in b.count, so we subtract reactions size from total reaction count
							collected.reduce((a, b) => a + b.count, 0) - collected.size
						}`
					);
					message.edit({ embeds: [embed] }).catch(console.error);

					break;
				}
				case 'messageDelete':
					message.channel
						.send('Poll aborted because the message was deleted')
						.catch(console.error);
					break;
				default:
					break;
			}
		});
	} catch (err) {
		console.error(err);
	}
};
