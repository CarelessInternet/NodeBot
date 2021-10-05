const {Commands, Guild, check} = require('../../economyClasses');
const {readFileSync} = require('fs');
const {MessageEmbed} = require('discord.js');

async function dice(user, interaction) {
  try {
    const validate = Commands.validateCash(interaction, user);
    if (validate) return interaction.reply(validate);

    const amount = interaction.options.get('amount')?.value;
    const number = interaction.options.get('number')?.value;
    const number2 = interaction.options.get('number2')?.value;
    if (number < 1 || number > 6) return interaction.reply({content: 'You must bet on a valid die side', ephemeral: true});
    
    const file = JSON.parse(readFileSync('./economy/dice.json', 'utf8'));
    const random = file[Math.floor(Math.random() * file.length)];
    const embed = new MessageEmbed()
    .setColor('RANDOM')
    .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL())
    .setTitle(`${number2 ? 'Dice' : 'Die'} Roll`)
    .setTimestamp();

    if (!number2) {
      const newAmount = random.value === number ? amount : -amount;

      await Guild.updateCash(user['ID'], user['Cash'] + newAmount);
      embed.setDescription(Math.abs(newAmount) === newAmount ? `🥳 You won ${newAmount.toLocaleString()} dollars!` : `😐 You lost ${newAmount.toLocaleString()} dollars, maybe better luck next time!`)
      .addFields({
        name: 'Your Choice:',
        value: `**${file[number - 1].emoji}**`
      }, {
        name: 'Result:',
        value: `**${random.emoji}**`
      });
    } else {
      if (number2 < 1 || number2 > 6) return interaction.reply({content: 'You must bet on a valid die side', ephemeral: true});

      const random2 = file[Math.floor(Math.random() * file.length)];
      const newAmount = (random.value === number && random2.value === number2) || (random2.value === number && random.value === number2) ? amount * 2 : -amount;

      await Guild.updateCash(user['ID'], user['Cash'] + newAmount);
      embed.setDescription(Math.abs(newAmount) === newAmount ? `🥳 You won ${newAmount.toLocaleString()} dollars!` : `😐 You lost ${newAmount.toLocaleString()} dollars, maybe better luck next time!`)
      .addFields({
        name: 'Your Choice:',
        value: `**${file[number - 1].emoji} ${file[number2 - 1].emoji}**`
      }, {
        name: 'Result:',
        value: `**${random.emoji} ${random2.emoji}**`
      });
    }

    interaction.reply({embeds: [embed]});
  } catch(err) {
    console.error(err);
    interaction.reply({
      content: 'An unknown error occured whilst rolling a die, please try again later',
      ephemeral: true
    }).catch(console.error);
  }
}

module.exports = {
  data: {
    name: "dice",
    description: "Bet on a dice roll",
    category: "economy",
    cooldown: 5,
    options: [
      {
        name: "amount",
        description: "The amount you want to bet",
        type: 4,
        required: true
      },
      {
        name: "number",
        description: "The side you want to bet on",
        type: 4,
        required: true
      },
      {
        name: "number2",
        description: "Optionally choose another side, receive double the money if you win, or lose the amount you bet",
        type: 4,
        required: false
      }
    ],
    examples: [
      "dice 500 3",
      "dice 1337 6 4",
      "dice 6969 2",
      "dice 7000 5 1"
    ]
  },
  async execute(interaction) {
    try {
      const userGuild = await check(interaction);
      return dice(userGuild, interaction);
    } catch(err) {
      console.error(err);
      interaction.reply({content: 'An unknown error occured, please try again later', ephemeral: true}).catch(console.error);
    }
  }
}