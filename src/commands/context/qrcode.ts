import { ContextMenuCommandBuilder } from '@discordjs/builders';
import { ApplicationCommandType } from 'discord-api-types';
import { Command } from '../../types';

export const category: Command['category'] = 'Context Menu';

export const data: Command['data'] = new ContextMenuCommandBuilder()
	.setName('Encode to QR code')
	.setType(ApplicationCommandType.Message);

export const execute: Command['execute'] = async ({ client, interaction }) => {
	client.commands.get('qrcode')?.execute({ client, interaction });
};
