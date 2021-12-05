import {
	ContextMenuCommandBuilder,
	SlashCommandBuilder,
	SlashCommandSubcommandsOnlyBuilder
} from '@discordjs/builders';
import { CommandInteraction, ContextMenuInteraction } from 'discord.js';
import { Client } from './index';

export interface Command {
	readonly execute: ({
		client,
		interaction
	}: {
		client: Client;
		interaction: CommandInteraction | ContextMenuInteraction;
	}) => Promise<void> | void;
	readonly data:
		| Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
		| SlashCommandBuilder
		| SlashCommandSubcommandsOnlyBuilder
		| ContextMenuCommandBuilder;
	readonly category:
		| 'Utility'
		| 'Game Related'
		| 'Economy'
		| 'Staff'
		| 'Context Menu'
		| 'Other';
	readonly guildOnly?: boolean;
	readonly ownerOnly?: boolean;
	readonly guildAndOwnerOnly?: boolean;
}
