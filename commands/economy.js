const fs = require('fs');
const dateFormat = require('dateformat');
const connection = require('../db');
const {MessageEmbed} = require('discord.js');

class User {
  static userInfo(id) {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM EconomyUsers WHERE UserID = ?', [id], (err, rows) => {
        if (err) reject(err);
        resolve(rows[0] ?? false);
      });
    });
  }
  static createUser({id, creationDate, userCreationDate}) {
    return new Promise((resolve, reject) => {
      /*
        EconomyUsers:
        ID, UserID, CreationDate, UserCreationDate
      */
      const data = [id, creationDate, userCreationDate]; 
      connection.query('INSERT INTO EconomyUsers (UserID, CreationDate, UserCreationDate) VALUES (?, ?, ?)', data, async err => {
        if (err) reject(err);
        try {
          const userData = await this.userInfo(id);
          resolve(userData);
        } catch(err2) {
          reject(err2);
        }
      });
    });
  }
}
class Guild {
  static #bitLimit = 2147483647 / 2;

  // cash and bank are 32 bit, so we have to make sure it doesnt go above or under half of 32 bit
  static #preventLimit(amount) {
    if (Math.abs(amount) > this.#bitLimit) return amount > 0 ? this.#bitLimit : -this.#bitLimit;
    else return amount;
  }

  static userInfo(userID, guildID) {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM EconomyGuilds WHERE UserID = ? AND GuildID = ?', [userID, guildID], (err, rows) => {
        if (err) reject(err);
        resolve(rows[0] ?? false);
      });
    });
  }

  static createGuildUser({userID, guildID, creationDate}) {
    return new Promise((resolve, reject) => {
      /*
        EconomyGuilds:
        ID, UserID, GuildID, CreationDate, Cash, Bank
      */
      const data = [userID, guildID, creationDate];
      connection.query('INSERT INTO EconomyGuilds (UserID, GuildID, CreationDate, Cash, Bank) VALUES (?, ?, ?, 1000, 0)', data, async err => {
        if (err) reject(err);
        try {
          const userGuildData = await this.userInfo(userID, guildID);
          resolve(userGuildData);
        } catch(err2) {
          reject(err2);
        }
      });
    });
  }

  static updateCash(id, amount) {
    return new Promise((resolve, reject) => {
      amount = this.#preventLimit(amount);
      connection.query('UPDATE EconomyGuilds SET Cash = ? WHERE ID = ?', [amount, id], err => {
        if (err) reject(err);
        resolve(amount);
      });
    });
  }

  static updateBank(id, amount) {
    return new Promise((resolve, reject) => {
      amount = this.#preventLimit(amount);
      connection.query('UPDATE EconomyGuilds SET Bank = ? WHERE ID = ?', [amount, id], err => {
        if (err) reject(err);
        resolve(amount);
      });
    });
  }

  static userStats(interaction, id) {
    return new Promise((resolve, reject) => {
      connection.query('SELECT Cash, Bank FROM EconomyGuilds WHERE ID = ?', [id], (err, rows) => {
        if (err) reject(err);
        const embed = new MessageEmbed()
        .setColor('RANDOM')
        .setAuthor(interaction.user.tag, interaction.user.avatarURL())
        .setTitle(`${interaction.user.username}${interaction.user.username.endsWith('s') ? '\'' : '\'s'} Economy`)
        .setDescription(`💰 The economy of ${interaction.user.username}:`)
        .addFields({
          name: 'Cash',
          value: '💵 ' + rows[0]['Cash'].toString()
        }, {
          name: 'Bank',
          value: '💵 ' + rows[0]['Bank'].toString()
        })
        .setTimestamp();

        resolve({embeds: [embed]});
      });
    });
  }
}
class Commands {
  static #validateCash(interaction, user) {
    const amount = interaction.options.get('amount')?.value;
    if (user['Cash'] < amount) {
      const embed = new MessageEmbed()
      .setColor('RED')
      .setAuthor(interaction.user.tag, interaction.user.avatarURL())
      .setTitle('Not Enough Cash')
      .setDescription(`❌ The amount you specified is more than the amount of cash you currently have, please withdraw some money or earn some.\n\n💵 You have $${user['Cash']} in cash`)
      .setTimestamp();
      return {embeds: [embed], ephemeral: true};
    } else if (amount < 50) {
      const embed = new MessageEmbed()
      .setColor('RED')
      .setAuthor(interaction.user.tag, interaction.user.avatarURL())
      .setTitle('Too Little Money')
      .setDescription(`❌ The amount must be more than or equal to 50 dollars`)
      .setTimestamp();
      return {embeds: [embed], ephemeral: true};
    } else {
      return false;
    }
  }

  static #validateBank(interaction, user) {
    const amount = interaction.options.get('amount')?.value;
    if (user['Bank'] < amount) {
      const embed = new MessageEmbed()
      .setColor('RED')
      .setAuthor(interaction.user.tag, interaction.user.avatarURL())
      .setTitle('Not Enough Money in Bank')
      .setDescription(`❌ The amount you specified is more than the amount of money you currently have in your bank, please deposit some money.\n\n💵 You have $${user['Bank']} in your bank`)
      .setTimestamp();
      return {embeds: [embed], ephemeral: true};
    } else if (amount < 50) {
      const embed = new MessageEmbed()
      .setColor('RED')
      .setAuthor(interaction.user.tag, interaction.user.avatarURL())
      .setTitle('Too Little Money')
      .setDescription(`❌ The amount must be more than or equal to 50 dollars`)
      .setTimestamp();
      return {embeds: [embed], ephemeral: true};
    } else {
      return false;
    }
  }

  static deposit(user, interaction) {
    return new Promise(async (resolve, reject) => {
      try {
        const validate = this.#validateCash(interaction, user);
        // resolve because if we reject the message will show error occured and not insufficient cash
        if (validate) return resolve(validate);

        const amount = interaction.options.get('amount')?.value;
        await Guild.updateBank(user['ID'], user['Bank'] + amount);
        await Guild.updateCash(user['ID'], user['Cash'] - amount);

        const stats = await Guild.userStats(interaction, user['ID']);
        stats.content = `Successfully deposited $${amount}`;
        resolve(stats);
      } catch(err) {
        reject(err);
      }
    });
  }

  static withdraw(user, interaction) {
    return new Promise(async (resolve, reject) => {
      try {
        const validate = this.#validateBank(interaction, user);
        if (validate) return resolve(validate);

        const amount = interaction.options.get('amount')?.value;
        await Guild.updateBank(user['ID'], user['Bank'] - amount);
        await Guild.updateCash(user['ID'], user['Cash'] + amount);

        const stats = await Guild.userStats(interaction, user['ID']);
        stats.content = `Successfully withdrew $${amount}`;
        resolve(stats);
      } catch(err) {
        reject(err);
      }
    });
  }

  static stats(user, interaction) {
    return new Promise(async (resolve, reject) => {
      try {
        const stats = await Guild.userStats(interaction, user['ID']);
        resolve(stats);
      } catch(err) {
        reject(err);
      }
    });
  }

  static work(user) {
    return new Promise(async (resolve, reject) => {
      try {
        const amount = Math.floor(Math.random() * 200) + 300;
        const file = JSON.parse(fs.readFileSync('./economy/work.json', 'utf8'));
        const random = file[Math.floor(Math.random() * file.length)];
        const message = random.replace(new RegExp('{amount}', 'g'), amount);
        
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

  static crime(user) {
    return new Promise(async (resolve, reject) => {
      try {
        const file = JSON.parse(fs.readFileSync('./economy/crime.json', 'utf8'));
        const luck = Math.floor(Math.random() * 2);
        const randomAmountOfDollars = Math.floor(Math.random() * 400) + 450;

        const amount = luck == 0 ? randomAmountOfDollars : -randomAmountOfDollars;
        const random = file[luck][Math.floor(Math.random() * file[luck].length)];
        const message = random.replace(new RegExp('{amount}', 'g'), amount);

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

  static async slotMachine(user, interaction) {
    try {
      const validate = this.#validateCash(interaction, user);
      if (validate) return interaction.reply(validate);
      
      const file = JSON.parse(fs.readFileSync('./economy/slot-machine.json', 'utf8'));
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
      embed.setDescription(win ? `🥳 You won $${amount}!` : `🤣 You lost ${amount} dollars`);
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

  static async dice(user, interaction) {
    try {
      const validate = this.#validateCash(interaction, user);
      if (validate) return interaction.reply(validate);

      const amount = interaction.options.get('amount')?.value;
      const number = interaction.options.get('number')?.value;
      const number2 = interaction.options.get('number2')?.value;
      if (number < 1 || number > 6) return interaction.reply({content: 'You must bet on a valid die side', ephemeral: true});
      
      const file = JSON.parse(fs.readFileSync('./economy/dice.json', 'utf8'));
      const random = file[Math.floor(Math.random() * file.length)];
      const embed = new MessageEmbed()
      .setColor('RANDOM')
      .setAuthor(interaction.user.tag, interaction.user.avatarURL())
      .setTitle(`${number2 ? 'Dice' : 'Die'} Roll`)
      .setTimestamp();

      if (!number2) {
        const newAmount = random.value === number ? amount : -amount;
  
        await Guild.updateCash(user['ID'], user['Cash'] + newAmount);
        embed.setDescription(Math.abs(newAmount) === newAmount ? `🥳 You won ${newAmount} dollars!` : `😐 You lost ${newAmount} dollars, maybe better luck next time!`)
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
        const newAmount = random.value === number && random2.value === number2 ? amount * 2 : -amount;

        await Guild.updateCash(user['ID'], user['Cash'] + newAmount);
        embed.setDescription(Math.abs(newAmount) === newAmount ? `🥳 You won ${newAmount} dollars!` : `😐 You lost ${newAmount} dollars, maybe better luck next time!`)
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
}

module.exports = {
  name: 'economy',
  async execute(interaction, command) {
    try {
      if (!interaction.inGuild()) return interaction.reply({content: 'You must be in a server to use this command', ephemeral: true});
      const userID = interaction.user.id;
      const guildID = interaction.guildId;
      let user = await User.userInfo(userID);
      let userGuild = await Guild.userInfo(userID, guildID);

      if (!user) {
        const creationDate = dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss');
        const createdTimestamp = dateFormat(interaction.user.createdAt, 'yyyy-mm-dd HH:MM:ss');
        user = await User.createUser({
          id: userID,
          creationDate: creationDate,
          userCreationDate: createdTimestamp
        });
      }
      if (!userGuild) {
        const creationDate = dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss');
        userGuild = await Guild.createGuildUser({
          userID: userID,
          guildID: guildID,
          creationDate: creationDate
        });
      }

      switch (command) {
        case 'deposit': {
          const embed = await Commands.deposit(userGuild, interaction);
          return interaction.reply(embed);
        }
        case 'withdraw': {
          const embed = await Commands.withdraw(userGuild, interaction);
          return interaction.reply(embed);
        }
        case 'stats': {
          const embed = await Commands.stats(userGuild, interaction);
          return interaction.reply(embed);
        }
        case 'work': {
          const embed = await Commands.work(userGuild);
          return interaction.reply(embed);
        }
        case 'crime': {
          const embed = await Commands.crime(userGuild);
          return interaction.reply(embed);
        }
        case 'slot-machine':
          return Commands.slotMachine(userGuild, interaction);
        case 'dice':
          return Commands.dice(userGuild, interaction);
        default:
          break;
      }
    } catch(err) {
      console.error(err);
      interaction.reply({
        content: 'An unknown error occured, please try again later',
        ephemeral: true
      }).catch(console.error);
    }
  }
}