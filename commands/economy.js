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
  static #bitLimit = Math.floor(2147483647 / 2);

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

  static createUserIfDoesntExist(member, guildID) {
    return new Promise(async (resolve, reject) => {
      try {
        const userID = member.user.id;
        let user = await User.userInfo(userID);
        let userGuild = await this.userInfo(userID, guildID);
  
        if (!user) {
          const creationDate = dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss');
          const createdTimestamp = dateFormat(member.user.createdAt, 'yyyy-mm-dd HH:MM:ss');
          user = await User.createUser({
            id: userID,
            creationDate: creationDate,
            userCreationDate: createdTimestamp
          });
        }
        if (!userGuild) {
          const creationDate = dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss');
          userGuild = await this.createGuildUser({
            userID: userID,
            guildID: guildID,
            creationDate: creationDate
          });
        }

        resolve({user: user, userGuild: userGuild});
      } catch(err) {
        reject(err);
      }
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
        .setTitle(`${interaction.user.username}${interaction.user.username.toLowerCase().endsWith('s') ? '\'' : '\'s'} Economy`)
        .setDescription(`💰 The economy of ${interaction.user.username}:`)
        .addFields({
          name: 'Cash',
          value: '💵 ' + rows[0]['Cash'].toLocaleString()
        }, {
          name: 'Bank',
          value: '💵 ' + rows[0]['Bank'].toLocaleString()
        })
        .setTimestamp();

        resolve({embeds: [embed]});
      });
    });
  }

  static guildList(guildID, limit = 5) {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM EconomyGuilds WHERE GuildID = ? LIMIT ?', [guildID, limit], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
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
      .setDescription(`❌ The amount you specified is more than the amount of cash you currently have, please withdraw some money or earn some.\n\n💵 You have $${user['Cash'].toLocaleString()} in cash`)
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
      .setDescription(`❌ The amount you specified is more than the amount of money you currently have in your bank, please deposit some money.\n\n💵 You have $${user['Bank'].toLocaleString()} in your bank`)
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
        stats.content = `Successfully deposited $${amount.toLocaleString()}`;
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
        stats.content = `Successfully withdrew $${amount.toLocaleString()}`;
        resolve(stats);
      } catch(err) {
        reject(err);
      }
    });
  }

  static addMoney(user, interaction) {
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
          .setDescription(`The requested user (${pingedUser.user.tag}) is a bot, please select a valid user`)
          .setTimestamp();

          return resolve({embeds: [embed]});
        }
        const {userGuild} = await Guild.createUserIfDoesntExist(pingedUser, interaction.guildId);

        const addedAmount = await Guild.updateBank(userGuild['ID'], userGuild['Bank'] + amount);
        const embed = new MessageEmbed()
        .setColor('RANDOM')
        .setAuthor(pingedUser.user.tag, pingedUser.user.avatarURL())
        .setTitle(`Successfully Added Money to ${pingedUser.user.username}${pingedUser.user.username.toLowerCase().endsWith('s') ? '\'' : '\'s'} Bank`)
        .setDescription(`The new economy of ${pingedUser.user.username}:`)
        .addFields({
          name: 'Added Amount of Money',
          value: '💵 ' + amount.toLocaleString()
        }, {
          name: 'Cash',
          value: '💵 ' + userGuild['Cash'].toLocaleString()
        }, {
          name: 'Bank',
          value: '💵 ' + addedAmount.toLocaleString()
        })
        .setTimestamp();

        resolve({embeds: [embed]});
      } catch(err) {
        reject(err);
      }
    });
  }

  static removeMoney(user, interaction) {
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
          .setDescription(`The requested user (${pingedUser.user.tag}) is a bot, please select a valid user`)
          .setTimestamp();

          return resolve({embeds: [embed]});
        }
        const {userGuild} = await Guild.createUserIfDoesntExist(pingedUser, interaction.guildId);

        const newAmount = await Guild.updateBank(userGuild['ID'], userGuild['Bank'] - amount);
        const embed = new MessageEmbed()
        .setColor('RANDOM')
        .setAuthor(pingedUser.user.tag, pingedUser.user.avatarURL())
        .setTitle(`Successfully Removed Money from ${pingedUser.user.username}${pingedUser.user.username.toLowerCase().endsWith('s') ? '\'' : '\'s'} Bank`)
        .setDescription(`The new economy of ${pingedUser.user.username}:`)
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

  static leaderboard(interaction) {
    return new Promise(async (resolve, reject) => {
      try {
        const guildID = interaction.guildId;
        const guildMembers = await Guild.guildList(guildID);
        guildMembers.sort((a, b) => {
          if (a['Cash'] + a['Bank'] < b['Cash'] + b['Bank']) return 1;
          if (a['Cash'] + a['Bank'] > b['Cash'] + b['Bank']) return -1;
          return 0;
        });

        const embed = new MessageEmbed()
        .setColor('RANDOM')
        .setTitle(`${interaction.guild.name} Leaderboard`)
        .setDescription(`💰 The current economy leaderboard of ${interaction.guild.name}`)
        .setTimestamp()
        .setFooter('This command only displays, at most the top 5 users in the guild');

        for (let i = 0; i < guildMembers.length; i++) {
          const user = guildMembers[i];

          // fetch by shard because we are using sharding, and not every user will be in one shard, so we have to get the one which has it
          // because the user might have left the server, so we cant use interaction.guild.members.fetch()
          // since they wont be in the guild members list
          const member = await interaction.client.shard.broadcastEval((client, id) => client.users.fetch(id), {context: user['UserID']});
          embed.addField(`${i + 1}: ${member[0].tag}`, `💵 Cash: ${user['Cash'].toLocaleString()}\n💸 Bank: ${user['Bank'].toLocaleString()}`);
        }

        resolve({embeds: [embed]});
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

  static crime(user) {
    return new Promise(async (resolve, reject) => {
      try {
        const file = JSON.parse(fs.readFileSync('./economy/crime.json', 'utf8'));
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
}

module.exports = {
  name: 'economy',
  async execute(interaction, command) {
    try {
      if (!interaction.inGuild()) return interaction.reply({content: 'You must be in a server to use this command', ephemeral: true});
      if (!interaction.guild.me.permissions.has('USE_EXTERNAL_EMOJIS')) return interaction.reply({content: 'I need the use external emojis permission to run currency commands'});

      const {userGuild} = await Guild.createUserIfDoesntExist(interaction.member, interaction.guildId);
      switch (command) {
        case 'deposit': {
          const embed = await Commands.deposit(userGuild, interaction);
          return interaction.reply(embed);
        }
        case 'withdraw': {
          const embed = await Commands.withdraw(userGuild, interaction);
          return interaction.reply(embed);
        }
        case 'add-money': {
          const embed = await Commands.addMoney(userGuild, interaction);
          return interaction.reply(embed);
        }
        case 'remove-money': {
          const embed = await Commands.removeMoney(userGuild, interaction);
          return interaction.reply(embed);
        }
        case 'stats': {
          const embed = await Commands.stats(userGuild, interaction);
          return interaction.reply(embed);
        }
        case 'economy-leaderboard': {
          const embed = await Commands.leaderboard(interaction);
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