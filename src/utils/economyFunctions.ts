import { RowDataPacket as Row } from 'mysql2';
import {
	Interaction,
	InteractionReplyOptions,
	MessageEmbed,
	Snowflake,
	User
} from 'discord.js';
import { memberNicknameMention } from '@discordjs/builders';
import { Tables } from '../types';
import { connection } from './index';

export class Users {
	public static async userInfo(id: Snowflake) {
		const [rows] = await connection.execute(
			'SELECT * FROM EconomyUsers WHERE UserID = ?',
			[id]
		);

		return (rows as Row)[0] as Tables.EconomyUsers | undefined;
	}

	public static async createUser(id: Snowflake, creationDate: Date) {
		await connection.execute(
			'INSERT INTO EconomyUsers (UserID, CreationDate) VALUES (?, ?)',
			[id, creationDate]
		);

		const rows = await this.userInfo(id);
		return rows as Tables.EconomyUsers;
	}
}

export class Guild {
	private static readonly _bitLimit = Math.floor(2147483647 / 2);

	private static _preventLimit(amount: number) {
		if (Math.abs(amount) > this._bitLimit) {
			return amount > 0 ? this._bitLimit : -this._bitLimit;
		} else {
			return amount;
		}
	}

	public static async userInfo(userId: Snowflake, guildId: Snowflake) {
		const [rows] = await connection.execute(
			'SELECT * FROM EconomyGuilds WHERE UserID = ? AND GuildID = ?',
			[userId, guildId]
		);

		return (rows as Row)[0] as Tables.EconomyGuilds | undefined;
	}

	public static async createGuildUser(userId: Snowflake, guildId: Snowflake) {
		await connection.execute(
			'INSERT INTO EconomyGuilds (UserID, GuildID, Cash, Bank) VALUES (?, ?, 1000, 0)',
			[userId, guildId]
		);

		const rows = await this.userInfo(userId, guildId);
		return rows as Tables.EconomyGuilds;
	}

	public static async createUserIfDoesntExist(
		member: User,
		guildId: Snowflake
	) {
		const { id } = member;
		let user = await Users.userInfo(id);
		let userGuild = await this.userInfo(id, guildId);

		if (!user) {
			user = await Users.createUser(id, new Date());
		}

		if (!userGuild) {
			userGuild = await this.createGuildUser(id, guildId);
		}

		return { user, userGuild };
	}

	public static async updateCash(id: number, amount: number) {
		amount = this._preventLimit(amount);
		await connection.execute('UPDATE EconomyGuilds SET Cash = ? WHERE ID = ?', [
			amount,
			id
		]);

		return amount;
	}

	public static async updateBank(id: number, amount: number) {
		amount = this._preventLimit(amount);
		await connection.execute('UPDATE EconomyGuilds SET Bank = ? WHERE ID = ?', [
			amount,
			id
		]);

		return amount;
	}

	public static async userStats(
		user: User,
		guildId: Snowflake
	): Promise<InteractionReplyOptions> {
		const rows = await this.userInfo(user.id, guildId);
		const rows2 = await Users.userInfo(user.id);

		const embed = new MessageEmbed()
			.setColor('RANDOM')
			.setAuthor(user.tag, user.displayAvatarURL({ dynamic: true }))
			.setTitle(`${user.username}'s Economy`)
			.setDescription(`💰 The economy of ${memberNicknameMention(user.id)}`)
			.addField('Cash', `💵 ${rows?.Cash.toLocaleString()}`)
			.addField('Bank', `💸 ${rows?.Bank.toLocaleString()}`)
			.setTimestamp(rows2?.CreationDate)
			.setFooter('First Usage Date:');

		return { embeds: [embed] };
	}

	public static async guildList(guildId: Snowflake) {
		const [rows] = await connection.execute(
			'SELECT * FROM EconomyGuilds WHERE GuildID = ? LIMIT 5',
			[guildId]
		);

		return rows as Tables.EconomyGuilds[];
	}
}

export class Commands {
	public static validateCash(
		interaction: Interaction,
		user: Tables.EconomyGuilds,
		amount: number
	): InteractionReplyOptions | false {
		const embed = new MessageEmbed()
			.setColor('RED')
			.setAuthor(
				interaction.user.tag,
				interaction.user.displayAvatarURL({ dynamic: true })
			)
			.setTimestamp();

		if (user.Cash < amount) {
			embed.setTitle('Not Enough Cash');
			embed.setDescription(
				'❌ The amount you specified is more than the amount of cash you have\n\n' +
					`💵 You have $${user.Cash} in cash`
			);

			return { embeds: [embed], ephemeral: true };
		} else if (amount < 50) {
			embed.setTitle('Too Little Money');
			embed.setDescription(
				'❌ The amount must be more than or equal to 50 dollars'
			);

			return { embeds: [embed], ephemeral: true };
		} else {
			return false;
		}
	}

	public static validateBank(
		interaction: Interaction,
		user: Tables.EconomyGuilds,
		amount: number
	): InteractionReplyOptions | false {
		const embed = new MessageEmbed()
			.setColor('RED')
			.setAuthor(
				interaction.user.tag,
				interaction.user.displayAvatarURL({ dynamic: true })
			)
			.setTimestamp();

		if (user.Bank < amount) {
			embed.setTitle('Not Enough Money');
			embed.setDescription(
				'❌ The amount you specified is more than the amount of money you have\n\n' +
					`💸 You have $${user.Bank} in your bank`
			);

			return { embeds: [embed], ephemeral: true };
		} else if (amount < 50) {
			embed.setTitle('Too Little Money');
			embed.setDescription(
				'❌ The amount must be more than or equal to 50 dollars'
			);

			return { embeds: [embed], ephemeral: true };
		} else {
			return false;
		}
	}
}

export async function handleUser(interaction: Interaction) {
	const { userGuild } = await Guild.createUserIfDoesntExist(
		interaction.user,
		interaction.guildId
	);

	return userGuild;
}
