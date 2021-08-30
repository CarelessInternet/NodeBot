const {Guild, check} = require('../../economyClasses');
const {readFileSync} = require('fs');
const {MessageEmbed} = require('discord.js');

function work(user) {
  return new Promise(async (resolve, reject) => {
    try {
      const amount = Math.floor(Math.random() * 200) + 300;
      const file = JSON.parse(readFileSync('./economy/work.json', 'utf8'));
      const random = file[Math.floor(Math.random() * file.length)];
      const message = random.replace(new RegExp('{amount}', 'g'), amount.toLocaleString());
      
      await Guild.updateCash(user['ID'], user['Cash'] + amount);
      const embed = new MessageEmbed()
      .setColor('RANDOM')
      .setTitle('Work')
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
    name: "work",
    description: "Effortlessly earn some money",
    category: "economy",
    cooldown: 180,
    options: [],
    examples: [
      "work"
    ]
  },
  async execute(interaction) {
    try {
      const userGuild = await check(interaction);
      const embed = await work(userGuild);
      interaction.reply(embed);
    } catch(err) {
      console.error(err);
      interaction.reply({content: 'An unknown error occured, please try again later', ephemeral: true}).catch(console.error);
    }
  }
}