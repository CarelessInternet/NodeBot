import { status } from 'minecraft-server-util';
import { MessageAttachment, MessageEmbed } from 'discord.js';
import { inlineCode, SlashCommandBuilder } from '@discordjs/builders';
import { Command } from '../../types';

export const category: Command['category'] = 'Game Related';

export const data: Command['data'] = new SlashCommandBuilder()
	.setName('mc')
	.setDescription('Returns information about a Minecraft server')
	.addStringOption((option) =>
		option
			.setName('ip')
			.setDescription('IP of the Minecraft server')
			.setRequired(true)
	)
	.addIntegerOption((option) =>
		option
			.setName('port')
			.setDescription('Port of the server, between 1 and 65535')
			.setRequired(false)
	);

export const execute: Command['execute'] = async ({ interaction }) => {
	if (interaction.isCommand()) {
		const [ip, port] = [
			interaction.options.getString('ip')!,
			interaction.options.getInteger('port') ?? 25565
		];

		await interaction.deferReply();

		status(ip, port, { timeout: 5_000 })
			.then((server) => {
				const embed = new MessageEmbed()
					.setColor('RANDOM')
					.setAuthor(
						interaction.user.tag,
						interaction.user.displayAvatarURL({ dynamic: true })
					)
					.setTitle('Minecraft Server Info')
					.addField('Server IP', inlineCode(server.srvRecord!.host))
					.addField('Current Online', server.players.online.toLocaleString())
					.addField('Maximum Players', server.players.max.toLocaleString())
					.addField('Version', server.version.name)
					.setTimestamp();

				let attachment: MessageAttachment | null = null;

				if (server.favicon) {
					attachment = new MessageAttachment(
						Buffer.from(server.favicon.split(',')[1], 'base64'),
						'favicon.png'
					);
					embed.setThumbnail('attachment://favicon.png');
				}

				interaction.editReply({
					embeds: [embed],
					...(attachment && { files: [attachment] })
				});
			})
			.catch((err) => {
				let reason = '';

				if (!err) {
					reason = 'An unknown error occured whilst trying to reach the server';
				} else if (err.code === 'ECONNREFUSED') {
					reason = 'Invalid port, please change the port';
				} else if (err.code === 'ENOTFOUND') {
					reason = 'Invalid Server IP';
				} else if (err.code === 'ERR_ASSERTION') {
					reason = 'Port must be less than 65536';
				} else if (err.code === 'ETIMEDOUT') {
					reason = 'Connection timed out whilst trying to reach the server';
				} else {
					reason = 'An unknown error occured, please try again later';
				}

				interaction.editReply({ content: reason }).catch(console.error);
			});
	}
};
