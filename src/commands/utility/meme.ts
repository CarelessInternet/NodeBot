import fetch from 'node-fetch';
import { SlashCommandBuilder } from '@discordjs/builders';
import { Command } from '../../types';
import { MessageEmbed } from 'discord.js';

export const category: Command['category'] = 'Utility';

export const data: Command['data'] = new SlashCommandBuilder()
	.setName('meme')
	.setDescription('Returns a meme from r/dankmemes');

export const execute: Command['execute'] = async ({ interaction }) => {
	const reddit = async (): Promise<MessageEmbed> => {
		const post = await fetch(
			'https://www.reddit.com/r/dankmemes/random/.json'
		).then((res) => res.json());
		const { data } = post[0].data.children[0];

		if (data.is_video || data.over_18) {
			return reddit();
		}

		const embed = new MessageEmbed()
			.setColor('RANDOM')
			.setAuthor(data.author)
			.setTitle(data.title)
			.setURL(`https://www.reddit.com${data.permalink}`)
			.setImage(data.url);

		return embed;
	};

	try {
		const redditPost = await reddit();
		interaction.reply({ embeds: [redditPost] });
	} catch (err) {
		console.error(err);
	}
};
