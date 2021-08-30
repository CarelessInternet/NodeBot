const {Guild, check} = require('../../economyClasses');
const {readFileSync} = require('fs');
const {MessageEmbed} = require('discord.js');

function crime(user) {
  return new Promise(async (resolve, reject) => {
    try {
      const file = JSON.parse(readFileSync('./economy/crime.json', 'utf8'));
      const luck = Math.floor(Math.random() * 2);
      const randomAmountOfDollars = Math.floor(Math.random() * 400) + 450;

      const amount = luck == 0 ? randomAmountOfDollars : -randomAmountOfDollars;
      const random = file[luck][Math.floor(Math.random() * file[luck].length)];
      const message = random.replace(new RegExp('{amount}', 'g'), amount.toLocaleString());

      await Guild.updateCash(user['ID'], user['Cash'] + amount);
      const embed = new MessageEmbed()
      .setColor(luck == 0 ? 'GREEN' : 'RED')
      .setTitle('Crime')
      .setDescription(message)
      .setTimestamp();

      resolve({embeds: [embed]});
    } catch(err) {
      reject(err);
    }
  });
}

module.exports = {
  data: {
    name: "crime",
    description: "You commit a crime and either get money or lose money. Can contain sensitive language",
    category: "economy",
    cooldown: 180,
    options: [],
    examples: [
      "crime"
    ]
  },
  async execute(interaction) {
    try {
      const userGuild = await check(interaction);
      const embed = await crime(userGuild);
      interaction.reply(embed);
    } catch(err) {
      console.error(err);
      interaction.reply({content: 'An unknown error occured, please try again later', ephemeral: true}).catch(console.error);
    }
  }
}