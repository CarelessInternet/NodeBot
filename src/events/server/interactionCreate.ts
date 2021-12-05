import { Interaction } from 'discord.js';
import { Handler } from '../../types';

export const execute: Handler['execute'] = (
	client,
	interaction: Interaction
) => {
	if (!interaction.isCommand() && !interaction.isContextMenu()) return;

	const cmd = interaction.commandName;
	const command = client.commands.get(cmd);

	if (!command) return;

	if (
		(command.guildOnly || command.guildAndOwnerOnly) &&
		!interaction.inGuild()
	) {
		interaction.reply({
			content: 'You need to be in a server to run this command',
			ephemeral: true
		});
		return;
	}

	if (
		(command.ownerOnly || command.guildAndOwnerOnly) &&
		interaction.user.id !== process.env.DISCORD_OWNER_ID
	) {
		interaction.reply({
			content: 'You need to be the owner of the bot to run this command',
			ephemeral: true
		});
		return;
	}

	command.execute({ client, interaction });
};
