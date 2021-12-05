import translate from '@vitalets/google-translate-api';
import { ContextMenuCommandBuilder } from '@discordjs/builders';
import { ApplicationCommandType } from 'discord-api-types';
import { Command } from '../../types';

export const category: Command['category'] = 'Context Menu';

export const data: Command['data'] = new ContextMenuCommandBuilder()
	.setName('Translate')
	.setType(ApplicationCommandType.Message);

export const execute: Command['execute'] = async ({ interaction }) => {
	try {
		await interaction.deferReply({ ephemeral: true });

		if (interaction.isContextMenu()) {
			const { content } = interaction.options.getMessage('message')!;

			if (!content) {
				interaction.editReply({
					content: 'You must give a valid message to be translated'
				});
				return;
			}

			const { text } = await translate(content, { to: 'en' });

			interaction.editReply({ content: text });
		}
	} catch (err) {
		console.error(err);
	}
};
