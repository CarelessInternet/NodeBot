const {Commands, Guild, check} = require('../../economyClasses');
const {MessageEmbed} = require('discord.js');

function removeMoney(interaction) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!interaction.member.permissions.has('MANAGE_GUILD')) {
        const embed = new MessageEmbed()
        .setColor('RED')
        .setAuthor(interaction.user.tag, interaction.user.avatarURL())
        .setTitle('Invalid Permissions')
        .setDescription('You need the manage server permission to run this command')
        .setTimestamp();

        return resolve({embeds: [embed]});
      }

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
      const {userGuild} = await Guild.createUserIfDoesntExist(pingedUser, interaction.guildId);

      const newAmount = await Guild.updateBank(userGuild['ID'], userGuild['Bank'] - amount);
      const embed = new MessageEmbed()
      .setColor('RANDOM')
      .setAuthor(interaction.user.tag, interaction.user.avatarURL())
      .setTitle(`Successfully Removed Money from ${pingedUser.user.username}${pingedUser.user.username.toLowerCase().endsWith('s') ? '\'' : '\'s'} Bank`)
      .setDescription(`The new economy of <@${pingedUser.user.id}>:`)
      .addFields({
        name: 'Removed Amount of Money',
        value: '💵 ' + amount.toLocaleString()
      }, {
        name: 'Cash',
        value: '💵 ' + userGuild['Cash'].toLocaleString()
      }, {
        name: 'Bank',
        value: '💵 ' + newAmount.toLocaleString()
      })
      .setTimestamp();

      resolve({embeds: [embed]});
    } catch(err) {
      reject(err);
    }
  });
}

module.exports = {
  data: {
    name: "remove-money",
    description: "Removes money from a pinged user",
    category: "economy",
    cooldown: 180,
    options: [
      {
        name: "user",
        description: "The user to remove money from",
        type: 6,
        required: true
      },
      {
        name: "amount",
        description: "The amount of money to remove from the bank",
        type: 4,
        required: true
      }
    ],
    examples: [
      "remove-money @CarelessInternet#8114 999999",
      "remove-money @someone#0001 420240",
      "remove-money @joe#6969 50",
      "remove-money @mamma#4200 69"
    ]
  },
  async execute(interaction) {
    try {
      const userGuild = await check(interaction);
      const embed = await removeMoney(interaction);
      interaction.reply(embed);
    } catch(err) {
      console.error(err);
      interaction.reply({content: 'An unknown error occured, please try again later', ephemeral: true}).catch(console.error);
    }
  }
}