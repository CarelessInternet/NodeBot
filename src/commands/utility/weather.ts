import fetch from 'node-fetch';
import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { Command } from '../../types';

export const category: Command['category'] = 'Utility';

export const data: Command['data'] = new SlashCommandBuilder()
	.setName('weather')
	.setDescription('Returns information about the weather in a city')
	.addStringOption((option) =>
		option
			.setName('city')
			.setDescription('The city you want the weather for')
			.setRequired(true)
	);

export const execute: Command['execute'] = async ({ interaction }) => {
	const city = (interaction as CommandInteraction).options.getString('city')!;

	try {
		const query = new URLSearchParams(city).toString();
		const key = process.env.WEATHER_API_KEY;

		const forecast = await fetch(
			`https://api.weatherapi.com/v1/current.json?key=${key}&q=${query}`
		).then((res) => res.json());

		if (forecast.error) {
			throw forecast.error.message;
		}

		const { location, current } = forecast;

		const embed = new MessageEmbed()
			.setColor('RANDOM')
			.setAuthor(
				interaction.user.tag,
				interaction.user.displayAvatarURL({ dynamic: true })
			)
			.setTitle(`Weather in ${location.name}, ${location.country}`)
			.addField(
				'Temperature',
				`${current.temp_c}°C, or ${current.temp_f}°F`,
				true
			)
			.addField(
				'Feels Like',
				`${current.feelslike_c}°C, or ${current.feelslike_f}°F`,
				true
			)
			.addField('Condition', current.condition.text, true)
			.addField('Humidity', `${current.humidity}%`, true)
			.addField('Cloud Coverage', `${current.cloud}%`, true)
			.addField(
				'Wind Speed and Direction',
				`Speed: ${current.wind_kph} km/h, or ${current.wind_mph} mph\nDirection: ${current.wind_dir}`,
				true
			)
			.setThumbnail(`http:${current.condition.icon}`)
			.setTimestamp(new Date(current.last_updated))
			.setFooter(`Local time: ${location.localtime}, Last updated:`);

		interaction.reply({ embeds: [embed] });
	} catch (err) {
		console.error(err);
	}
};
