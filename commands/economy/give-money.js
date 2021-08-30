const {Commands, Guild, check} = require('../../economyClasses');
const {MessageEmbed} = require('discord.js');

function giveMoney(user, interaction) {
  return new Promise(async (resolve, reject) => {
    try {
      const validate = Commands.validateBank(interaction, user);
      if (validate) return resolve(validate);
  
      const amount = interaction.options.get('amount')?.value;
      const pingedUser = interaction.options.get('user')?.member;
      if (pingedUser.user.bot) {
        const embed = new MessageEmbed()
        .setColor('RED')
        .setAuthor(interaction.user.tag, interaction.user.avatarURL())
        .setTitle('The User is a Bot')
        .setDescription(`The requested user (<@${pingedUser.user.id}>) is a bot, please select a valid user`)
        .setTimestamp();
  
        return resolve({embeds: [embed], ephemeral: true});
      }
      if (pingedUser.id === interaction.user.id) {
        const embed = new MessageEmbed()
        .setColor('RED')
        .setAuthor(interaction.user.tag, interaction.user.avatarURL())
        .setTitle('You Cannot Give Money to Yourself')
        .setDescription('Bruh, give it to someone else')
        .setTimestamp();
  
        return resolve({embeds: [embed], ephemeral: true});
      }
      
      const {userGuild} = await Guild.createUserIfDoesntExist(pingedUser, interaction.guildId);
      const newRemovedAmount = await Guild.updateBank(user['ID'], user['Bank'] - amount);
      const newAddedAmount = await Guild.updateBank(userGuild['ID'], userGuild['Bank'] + amount);
      const embed = new MessageEmbed()
      .setColor('RANDOM')
      .setAuthor(interaction.user.tag, interaction.user.avatarURL())
      .setTitle(`Successfully Gave Money to ${pingedUser.user.username}${pingedUser.user.username.toLowerCase().endsWith('s') ? '\'' : '\'s'} Bank`)
      .setDescription(`The new economy of <@${pingedUser.user.id}>:`)
      .addFields({
        name: 'Money Added',
        value: '💵 ' + amount.toLocaleString(),
        inline: true
      }, {
        name: 'Cash',
        value: '💵 ' + userGuild['Cash'],
        inline: true
      }, {
        name: '\u200B',
        value: '\u200B'
      }, {
        name: `Bank of ${interaction.user.username}`,
        value: '💵 ' + newRemovedAmount.toLocaleString(),
        inline: true
      }, {
        name: `Bank of ${pingedUser.user.username}`,
        value: '💵 ' + newAddedAmount.toLocaleString(),
        inline: true
      })
      .setTimestamp();
  
      resolve({embeds: [embed]});
    } catch(err) {
      reject(err);
    }
  })
}

module.exports = {
  data: {
    name: "give-money",
    description: "Gives money to another use from your own bank",
    category: "economy",
    options: [
      {
        name: "user",
        description: "The user you want to give money to",
        type: 6,
        required: true
      },
      {
        name: "amount",
        description: "The amount you want to give",
        type: 4,
        required: true
      }
    ],
    examples: [
      "give-money @CarelessInternet#8114 999999",
      "give-money @someone#0001 420240",
      "give-money @joe#6969 50",
      "give-money @mamma#4200 69"
    ]
  },
  async execute(interaction) {
    try {
      const userGuild = await check(interaction);
      const embed = await giveMoney(userGuild, interaction);
      interaction.reply(embed);
    } catch(err) {
      console.error(err);
      interaction.reply({content: 'An unknown error occured, please try again later', ephemeral: true}).catch(console.error);
    }
  }
}