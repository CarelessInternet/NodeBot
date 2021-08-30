const {Commands, Guild, check} = require('../../economyClasses');

function stats(user, interaction) {
  return new Promise(async (resolve, reject) => {
    try {
      const stats = await Guild.userStats(interaction, user['ID']);
      resolve(stats);
    } catch(err) {
      reject(err);
    }
  });
}

module.exports = {
  data: {
    name: "stats",
    description: "Returns stats about your current economy",
    category: "economy",
    options: [],
    examples: [
      "stats"
    ]
  },
  async execute(interaction) {
    try {
      const userGuild = await check(interaction);
      const embed = await stats(userGuild, interaction);
      interaction.reply(embed);
    } catch(err) {
      console.error(err);
      interaction.reply({content: 'An unknown error occured, please try again later', ephemeral: true}).catch(console.error);
    }
  }
}