import { ContextMenuCommandBuilder } from '@discordjs/builders';
import { ApplicationCommandType } from 'discord-api-types';
import { Command } from '../../types';

export const category: Command['category'] = 'Context Menu';

export const data: Command['data'] = new ContextMenuCommandBuilder()
	.setName('Connect Four')
	.setType(ApplicationCommandType.User);

export const execute: Command['execute'] = ({ client, interaction }) => {
	client.commands.get('connect-four')?.execute({ client, interaction });
};
