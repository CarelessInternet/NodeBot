// add-money, give-money, remove-money subcommands
import { GuildMember, MessageEmbed } from 'discord.js';
import {
	memberNicknameMention,
	SlashCommandBuilder
} from '@discordjs/builders';
import { economyFunctions } from '../../utils';
import { Command } from '../../types';

export const guildOnly: Command['guildOnly'] = true;

export const category: Command['category'] = 'Economy';

export const data: Command['data'] = new SlashCommandBuilder()
	.setName('money')
	.setDescription('Money transfer related commands')
	.addSubcommand((subcommand) =>
		subcommand
			.setName('add')
			.setDescription('Adds money to a specified user')
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('The user to give money to')
					.setRequired(true)
			)
			.addIntegerOption((option) =>
				option
					.setName('amount')
					.setDescription('The amount of money to add')
					.setRequired(true)
			)
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('give')
			.setDescription('Gives money to another user from your own bank')
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('The user you want to give money to')
					.setRequired(true)
			)
			.addIntegerOption((option) =>
				option
					.setName('amount')
					.setDescription('The amount of money you want to give')
					.setRequired(true)
			)
	)
	.addSubcommand((subcommand) =>
		subcommand
			.setName('remove')
			.setDescription('Removes money from a user')
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('The user to remove money from')
					.setRequired(true)
			)
			.addIntegerOption((option) =>
				option
					.setName('amount')
					.setDescription('The amount of money to remove from the bank')
					.setRequired(true)
			)
	);

export const execute: Command['execute'] = async ({ interaction }) => {
	try {
		if (interaction.isCommand()) {
			const user = await economyFunctions.handleUser(interaction);
			const amount = interaction.options.getInteger('amount')!;

			switch (interaction.options.getSubcommand()) {
				case 'add': {
					if (!interaction.memberPermissions!.has(['MANAGE_GUILD'])) {
						return interaction.reply({
							content:
								'You need the manage server permission to run this command',
							ephemeral: true
						});
					}

					const member = interaction.options.getMember('user') as GuildMember;

					if (member.user.bot) {
						return interaction.reply({
							content: 'User cannot be a bot',
							ephemeral: true
						});
					}

					const { userGuild } =
						await economyFunctions.Guild.createUserIfDoesntExist(
							member.user,
							interaction.guildId
						);
					const addedAmount = await economyFunctions.Guild.updateBank(
						userGuild.ID,
						userGuild.Bank + amount
					);

					const embed = new MessageEmbed()
						.setColor('DARK_GREEN')
						.setAuthor(
							interaction.user.tag,
							interaction.user.displayAvatarURL({ dynamic: true })
						)
						.setTitle('Successfully Added Money')
						.setDescription(
							`The new economy of ${memberNicknameMention(member.id)}`
						)
						.addField('Added Amount of Money', `💵 ${amount.toLocaleString()}`)
						.addField('Cash', `💵 ${userGuild.Cash.toLocaleString()}`)
						.addField('Bank', `💸 ${addedAmount.toLocaleString()}`)
						.setTimestamp();

					return interaction.reply({ embeds: [embed] });
				}
				case 'give': {
					const validate = economyFunctions.Commands.validateBank(
						interaction,
						user,
						amount
					);

					if (validate) {
						return interaction.reply(validate);
					}

					const member = interaction.options.getMember('user') as GuildMember;

					if (member.user.bot) {
						return interaction.reply({
							content: 'User cannot be a bot',
							ephemeral: true
						});
					}
					if (member.id === interaction.user.id) {
						return interaction.reply({
							content: 'You cannot give money to yourself',
							ephemeral: true
						});
					}

					const { userGuild } =
						await economyFunctions.Guild.createUserIfDoesntExist(
							member.user,
							interaction.guildId
						);
					const newRemovedAmount = await economyFunctions.Guild.updateBank(
						user.ID,
						user.Bank - amount
					);
					const newAddedAmount = await economyFunctions.Guild.updateBank(
						userGuild.ID,
						userGuild.Bank + amount
					);

					const embed = new MessageEmbed()
						.setColor('DARK_GREEN')
						.setAuthor(
							interaction.user.tag,
							interaction.user.displayAvatarURL({ dynamic: true })
						)
						.setTitle('Successfully Gave Money')
						.setDescription(
							`The new economy of ${memberNicknameMention(member.id)}`
						)
						.addField('Money Added', `💵 ${amount.toLocaleString()}`)
						.addField('Cash', `💵 ${userGuild.Cash}`)
						.addField(
							`Bank of ${interaction.user.username}`,
							`💸 ${newRemovedAmount.toLocaleString()}`
						)
						.addField(
							`Bank of ${member.user.username}`,
							`💸 ${newAddedAmount.toLocaleString()}`
						)
						.setTimestamp();

					return interaction.reply({ embeds: [embed] });
				}
				case 'remove': {
					if (!interaction.memberPermissions!.has(['MANAGE_GUILD'])) {
						return interaction.reply({
							content:
								'You need the manage server permission to run this command',
							ephemeral: true
						});
					}

					const member = interaction.options.getMember('user') as GuildMember;

					if (member.user.bot) {
						return interaction.reply({
							content: 'User cannot be a bot',
							ephemeral: true
						});
					}

					const { userGuild } =
						await economyFunctions.Guild.createUserIfDoesntExist(
							member.user,
							interaction.guildId
						);
					const removedAmount = await economyFunctions.Guild.updateBank(
						userGuild.ID,
						userGuild.Bank - amount
					);

					const embed = new MessageEmbed()
						.setColor('DARK_GREEN')
						.setAuthor(
							interaction.user.tag,
							interaction.user.displayAvatarURL({ dynamic: true })
						)
						.setTitle('Successfully Removed Money')
						.setDescription(
							`The new economy of ${memberNicknameMention(member.id)}`
						)
						.addField(
							'Removed Amount of Money',
							`💵 ${amount.toLocaleString()}`
						)
						.addField('Cash', `💵 ${userGuild.Cash.toLocaleString()}`)
						.addField('Bank', `💸 ${removedAmount.toLocaleString()}`)
						.setTimestamp();

					return interaction.reply({ embeds: [embed] });
				}
				default:
					break;
			}
		}
	} catch (err) {
		console.error(err);
	}
};
