const fetch = require('node-fetch');
const {MessageEmbed} = require('discord.js');

module.exports = {
  data: {
    name: "weather",
    description: "Gives information about the weather in a city",
    category: "utility",
    options: [
      {
        name: "city",
        description: "The city's weather",
        type: 3,
        required: true
      }
    ],
    examples: [
      "weather Los Angeles",
      "weather Jakarta",
      "weather Stockholm",
      "weather Pyongyang"
    ]
  },
  async execute(interaction) {
    const arg = interaction.options.get('city')?.value;
    try {
      const city = new URLSearchParams(arg).toString();
      const key = process.env.weatherAPIKey;
      const forecast = await fetch(`http://api.weatherapi.com/v1/current.json?key=${key}&q=${city}`).then(res => res.json());
      if (forecast.error) throw forecast.error.message;

      const location = forecast.location;
      const current = forecast.current;
      const embed = new MessageEmbed()
      .setColor('RANDOM')
      .setTitle(`Weather in ${location.name}, ${location.country}`)
      .setDescription('The weather command shows the current weather in a city. Several day forecasting is unavailable because I can\'t be bothered to do that.')
      .addFields({
        name: 'Last Updated',
        value: `<t:${Math.floor(new Date(current['last_updated']).getTime() / 1000)}:R>`
      }, {
        name: '\u200B',
        value: '\u200B'
      }, {
        name: 'Temperature',
        value: `${current['temp_c']}°C, or ${current['temp_f']}°F`,
        inline: true
      }, {
        name: 'Feels Like',
        value: `${current['feelslike_c']}°C, or ${current['feelslike_f']}°F`,
        inline: true
      }, {
        name: 'Condition',
        value: current.condition.text,
        inline: true
      }, {
        name: 'Humidity',
        value: `${current.humidity}%`,
        inline: true
      }, {
        name: 'Cloud Coverage',
        value: `${current.cloud}%`,
        inline: true
      }, {
        name: 'Wind Speed and Direction',
        value: `Speed: ${current['wind_kph']} km/h, or ${current['wind_mph']} mph\nDirection: ${current['wind_dir']}`,
        inline: true
      })
      .setImage(`http:${current.condition.icon}`)
      .setTimestamp()
      .setFooter(`Local Time in ${location.name}: ${location.localtime}`);

      interaction.reply({embeds: [embed]});
    } catch(err) {
      interaction.reply(err || 'An unknown error occured, please try again later').catch(console.error);
    }
  }
}