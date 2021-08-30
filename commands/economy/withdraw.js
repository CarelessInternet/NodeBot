const {Commands, Guild, check} = require('../../economyClasses');

function withdraw(user, interaction) {
  return new Promise(async (resolve, reject) => {
    try {
      const validate = Commands.validateBank(interaction, user);
      if (validate) return resolve(validate);

      const amount = interaction.options.get('amount')?.value;
      await Guild.updateBank(user['ID'], user['Bank'] - amount);
      await Guild.updateCash(user['ID'], user['Cash'] + amount);

      const stats = await Guild.userStats(interaction, user['ID']);
      stats.content = `Successfully withdrew $${amount.toLocaleString()}`;
      resolve(stats);
    } catch(err) {
      reject(err);
    }
  });
}

module.exports = {
  data: {
    name: "withdraw",
    description: "Withdraw money from your bank",
    category: "economy",
    options: [
      {
        name: "amount",
        description: "The amount you want to withdraw",
        type: 4,
        required: true
      }
    ],
    examples: [
      "withdraw 69",
      "withdraw 1337",
      "withdraw 6969",
      "withdraw 42069"
    ]
  },
  async execute(interaction) {
    try {
      const userGuild = await check(interaction);
      const embed = await withdraw(userGuild, interaction);
      interaction.reply(embed);
    } catch(err) {
      console.error(err);
    }
  }
}