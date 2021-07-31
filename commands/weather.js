const fetch = require('node-fetch');
const randomHexColor = require('random-hex-color');

module.exports = {
  name: 'weather',
  description: 'Gives information about the weather in a city',
  async execute(msg, args, Discord) {
    if (!args[0]) return msg.reply('Please include the city').catch(console.error);
    try {
      const city = new URLSearchParams(args.join(' ')).toString();
      const key = process.env.weatherAPIKey;
      const forecast = await fetch(`http://api.weatherapi.com/v1/current.json?key=${key}&q=${city}`).then(res => res.json());
      if (forecast.error) throw forecast.error.message;

      const location = forecast.location;
      const current = forecast.current;
      const embed = new Discord.MessageEmbed()
      .setColor(randomHexColor())
      .setTitle(`Weather in ${location.name}, ${location.country}`)
      .setDescription('The weather command shows the current weather in a city. Several day forecasting is unavailable because I can\'t be bothered to do that.')
      .addFields({
        name: 'Last Updated',
        value: current['last_updated']
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
      .setImage(`https:${current.condition.icon}`)
      .setTimestamp()
      .setFooter(`Local Time in ${location.name}: ${location.localtime}`);

      msg.reply({embeds: [embed]}).catch(console.error);
    } catch(err) {
      msg.reply(err || 'An unknown error occured, please try again later').catch(console.error);
    }
  }
}