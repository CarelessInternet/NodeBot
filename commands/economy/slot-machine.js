const {Commands, Guild, check} = require('../../economyClasses');
const {readFileSync} = require('fs');
const {MessageEmbed} = require('discord.js');

async function slotMachine(user, interaction) {
  try {
    const validate = Commands.validateCash(interaction, user);
    if (validate) return interaction.reply(validate);
    
    const file = JSON.parse(readFileSync('./economy/slot-machine.json', 'utf8'));
    const embed = new MessageEmbed()
    .setColor('RANDOM')
    .setAuthor(interaction.user.tag, interaction.user.avatarURL())
    .setTitle('Slot Machine')
    .setTimestamp();
    const resultArray = [[], [], []];

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const random = file[Math.floor(Math.random() * file.length)].value;
        resultArray[i][j] = random;
      }
    }

    let string = '';
    for (let i = 0; i < resultArray.length; i++) {
      for (let j = 0; j < resultArray[i].length; j++) {
        string += `${resultArray[i][j]} | `;
      }
      string = string.slice(0, -3);

      if (i === 1) string += ' ⬅️';
      string += '\n';
    }
    embed.addField('Result:', string);

    let win = false;
    if (resultArray[1][0] === resultArray[1][1] && resultArray[1][1] === resultArray[1][2]) win = true;

    let amount = win ? interaction.options.get('amount')?.value : -interaction.options.get('amount')?.value;
    embed.setDescription(win ? `🥳 You won $${amount.toLocaleString()}!` : `🤣 You lost ${amount.toLocaleString()} dollars`);
    await Guild.updateCash(user['ID'], user['Cash'] + amount);

    interaction.reply({embeds: [embed]});
  } catch(err) {
    console.error(err);
    interaction.reply({
      content: 'An unknown error occured, please try again later',
      ephemeral: true
    }).catch(console.error);
  }
}

module.exports = {
  data: {
    name: "slot-machine",
    description: "Spins a slot machine",
    category: "economy",
    cooldown: 5,
    options: [
      {
        name: "amount",
        description: "The amount of money you want to bet",
        type: 4,
        required: true
      }
    ],
    examples: [
      "slot-machine 100",
      "slot-machine 500",
      "slot-machine 6969",
      "slot-machine 42069"
    ]
  },
  async execute(interaction) {
    try {
      const userGuild = await check(interaction);
      return slotMachine(userGuild, interaction);
    } catch(err) {
      console.error(err);
      interaction.reply({content: 'An unknown error occured, please try again later', ephemeral: true}).catch(console.error);
    }
  }
}