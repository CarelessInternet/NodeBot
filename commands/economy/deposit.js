const {Commands, Guild, check} = require('../../economyClasses');

function deposit(user, interaction) {
  return new Promise(async (resolve, reject) => {
    try {
      const validate = Commands.validateCash(interaction, user);
      // resolve because if we reject the message will show error occured and not insufficient cash
      if (validate) return resolve(validate);

      const amount = interaction.options.getInteger('amount');
      await Guild.updateBank(user['ID'], user['Bank'] + amount);
      await Guild.updateCash(user['ID'], user['Cash'] - amount);

      const stats = await Guild.userStats(interaction, user['ID']);
      stats.content = `Successfully deposited $${amount.toLocaleString()}`;
      resolve(stats);
    } catch(err) {
      reject(err);
    }
  });
}

module.exports = {
  data: {
    name: "deposit",
    description: "Deposits money from your cash into your bank",
    category: "economy",
    options: [
      {
        name: "amount",
        description: "The amount you want to deposit into your bank",
        type: 4,
        required: true
      }
    ],
    examples: [
      "deposit 500",
      "deposit 1000",
      "deposit 6969",
      "deposit 420691337"
    ]
  },
  async execute(interaction) {
    try {
      const userGuild = await check(interaction);
      const embed = await deposit(userGuild, interaction);
      interaction.reply(embed);
    } catch(err) {
      console.error(err);
      interaction.reply({content: 'An unknown error occured, please try again later', ephemeral: true}).catch(console.error);
    }
  }
}