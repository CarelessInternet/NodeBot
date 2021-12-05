import { Snowflake } from 'discord.js';

export interface EconomyUsers {
	ID: number;
	UserID: Snowflake;
	CreationDate: Date;
}

export interface EconomyGuilds {
	ID: number;
	UserID: Snowflake;
	GuildID: Snowflake;
	Cash: number;
	Bank: number;
}
