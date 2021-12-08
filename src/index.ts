/**
 * Console log color definitions:
 * [Green] - Sharding Manager
 * [Blue] - Client
 * [Red] - Shard Error
 */

import { ShardingManager } from 'discord.js';
import { AutoPoster } from 'topgg-autoposter';
import { config } from 'dotenv';
import { resolve } from 'path';
import { green } from 'chalk';

config();

const { DISCORD_BOT_TOKEN: token, TOP_GG_TOKEN } = process.env;
const manager = new ShardingManager(resolve(__dirname, './bot.js'), { token });

manager.on('shardCreate', (shard) => {
	console.log(
		`${green('[Sharding]')} Created shard #${
			shard.id
		} at ${new Date().toLocaleString()}`
	);
});

if (process.env.NODE_ENV === 'production') {
	const poster = AutoPoster(TOP_GG_TOKEN, manager);
	poster.on('error', console.error);
}

manager.spawn();
