const fs = require('fs');
const dateFormat = require('dateformat');
const fetch = require('node-fetch');
const shuffle = require('shuffle-array');
const connection = require('../db');
const {MessageActionRow, MessageButton, MessageEmbed} = require('discord.js');

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
        .setDescription(`💰 The economy of <@${interaction.user.id}>:`)
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
  static #capitalize(word) {
    const lowercase = word.toLowerCase();
    return lowercase.charAt(0).toUpperCase() + lowercase.slice(1);
  }

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

          return resolve({embeds: [embed], ephemeral: true});
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

        const addedAmount = await Guild.updateBank(userGuild['ID'], userGuild['Bank'] + amount);
        const embed = new MessageEmbed()
        .setColor('RANDOM')
        .setAuthor(interaction.user.tag, interaction.user.avatarURL())
        .setTitle(`Successfully Added Money to ${pingedUser.user.username}${pingedUser.user.username.toLowerCase().endsWith('s') ? '\'' : '\'s'} Bank`)
        .setDescription(`The new economy of <@${pingedUser.user.id}>:`)
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

  static giveMoney(user, interaction) {
    return new Promise(async (resolve, reject) => {
      try {
        const validate = this.#validateBank(interaction, user);
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

  static #blackjackCreateGame() {
    return new Promise(async (resolve, reject) => {
      try {
        // i copied the deck of cards json into a file called blackjack.json to prevent errors when fetching
        // because sometimes a 500 error occurs when getting a response from the website.
        // i also did this to improve performance
        // credits to deckofcardsapi.com for the json
        const json = JSON.parse(fs.readFileSync('./economy/blackjack.json', 'utf8'));
        const deck = shuffle(json);

        resolve(deck);
      } catch(err) {
        reject(err);
      }
    });
  }

  static #blackjackDrawCard(deck, count = 1) {
    return new Promise(async (resolve, reject) => {
      try {
        if (count > 1) {
          const cards = [];
          for (let i = 0; i < count; i++) {
            cards.push(deck.shift());
          }
          return resolve(cards);
        }
        
        resolve(deck.shift());
      } catch(err) {
        reject(err);
      }
    });
  }

  static #blackjackCardValue(card) {
    if (card === 'JACK' || card === 'QUEEN' || card === 'KING') return 10;
    else if (card === 'ACE') return 11;
    else return parseInt(card);
  }

  static #blackjackHandValue(hand) {
    let score = hand.reduce((acc, curr) => acc + this.#blackjackCardValue(curr['value']), 0);
    let aces = hand.filter(card => card['value'] === 'ACE').length;

    while (aces > 0) {
      if (score > 21) {
        score -= 10;
        aces--;
      } else {
        break;
      }
    }

    if (score < 21) return [score.toString(), score];
    else if (score === 21) return ['Blackjack!', score];
    else return ['Bust!', score];
  }

  static async #blackjackDealersTurn(i, embed, row, user, interaction, cards, deck) {
    try {
      row.components.forEach(button => button.disabled = true);
      const amount = interaction.options.get('amount')?.value;
      const playerValue = cards['player'][0]['value'];
      const playerValue2 = cards['player'][1]['value'];
      const dealerValue = cards['dealer'][0]['value'];

      const playerHand = this.#blackjackHandValue(cards['player'])[1];
      const playerHasAce = playerValue === 'ACE' || playerValue2 === 'ACE';
      const arrayOf10 = ['JACK', 'QUEEN', 'KING', '10'];
      const checkFor10 = c => arrayOf10.includes(c[0]['value']) || arrayOf10.includes(c[1]['value']);
      
      if (playerHand > 21) {
        await Guild.updateCash(user['ID'], user['Cash'] - amount);
        embed.description = `<:haha:875143747640365107> You lost the game and $${amount.toLocaleString()}`;
      } else {
        while (this.#blackjackHandValue(cards['dealer'])[1] < 17) {
          cards['dealer'].push(await this.#blackjackDrawCard(deck));
          embed.fields[1].value += `\n${cards['dealer'].at(-1)['value']} of ${this.#capitalize(cards['dealer'].at(-1)['suit'])}`;
        }

        const dealerHand = this.#blackjackHandValue(cards['dealer'])[1];
        const dealerValue2 = cards['dealer'][1]['value'];
        const dealerHasAce = dealerValue === 'ACE' || dealerValue2 === 'ACE';
        embed.fields[4].value = dealerHasAce && checkFor10(cards['dealer']) && dealerHand === 21 ? this.#blackjackHandValue(cards['dealer'])[0] : (dealerHand > 21 ? this.#blackjackHandValue(cards['dealer'])[0] : dealerHand.toString());
        
        const playerScore = this.#blackjackHandValue(cards['player'])[1];
        const dealerScore = this.#blackjackHandValue(cards['dealer'])[1];
        // comments to make it easier to read
        if (dealerScore > 21 || playerScore > dealerScore) {
          await Guild.updateCash(user['ID'], user['Cash'] + amount);
          embed.description = `🥳 You won against the dealer and got $${amount.toLocaleString()}!`;
        } else if (playerScore === dealerScore) {
          // if player has blackjack and dealer does not, or opposite, or neither
          if (playerHasAce && !dealerHasAce && checkFor10(cards['player']) && playerScore === 21) {
            await Guild.updateCash(user['ID'], user['Cash'] + amount);
            embed.description = `😌 You have a blackjack, and the dealer doesn't, you win $${amount.toLocaleString()}!`;
            // comments
          } else if (dealerHasAce && !playerHasAce && checkFor10(cards['dealer']) && dealerScore === 21) {
            await Guild.updateCash(user['ID'], user['Cash'] - amount);
            embed.description = `😔 The dealer has a blackjack, and you don't, you lose $${amount.toLocaleString()}`;
          } else {
            embed.description = `🧐 It's a draw! No one wins`;
          }
          // comments
        } else if (playerScore < dealerScore) {
          await Guild.updateCash(user['ID'], user['Cash'] - amount);
          embed.description = `<:haha:875143747640365107> You lost the game and $${amount.toLocaleString()}`;
        }
      }
      
      embed.fields[3].value = playerHasAce && checkFor10(cards['player']) && playerHand === 21 ? this.#blackjackHandValue(cards['player'])[0] : (playerHand > 21 ? this.#blackjackHandValue(cards['player'])[0] : playerHand.toString());
      i.update({embeds: [embed], components: [row]});
    } catch(err) {
      console.error(err);
      i.update({content: 'An unknown error occured whilst playing blackjack, please try again', components: []});
    }
  }

  static async blackjack(user, interaction) {
    // blackjack wouldnt have been possible without this tutorial: https://brilliant.org/wiki/programming-blackjack/
    // for any poor souls who are trying to understand the blackjack code, i am sorry
    try {
      const validate = await this.#validateCash(interaction, user);
      if (validate) return interaction.reply(validate);
      
      interaction.deferReply();
      const amount = interaction.options.get('amount')?.value;
      const deck = await this.#blackjackCreateGame();
      const cards = {
        player: [],
        dealer: []
      };
      const buttons = [{
        id: 'Hit',
        value: 'Hit',
        color: 'PRIMARY'
      }, {
        id: 'Stand',
        value: 'Stand',
        color: 'SUCCESS'
      }];
      const embed = new MessageEmbed()
      .setColor('RANDOM')
      .setAuthor(interaction.user.tag, interaction.user.avatarURL())
      .setTitle('Blackjack')
      .setDescription(`Betting for $${amount.toLocaleString()}`)
      .setTimestamp();
      const row = new MessageActionRow();

      for (let i = 0; i < buttons.length; i++) {
        row.addComponents(
          new MessageButton()
          .setCustomId(buttons[i]['id'])
          .setLabel(buttons[i]['value'])
          .setStyle(buttons[i]['color'])
        );
      }
      
      cards['player'] = await this.#blackjackDrawCard(deck, 2);
      cards['dealer'].push(await this.#blackjackDrawCard(deck));
      embed.addFields({
        name: 'Your Hand',
        value: `${cards['player'][0]['value']} of ${this.#capitalize(cards['player'][0]['suit'])}\n${cards['player'][1]['value']} of ${this.#capitalize(cards['player'][1]['suit'])}`,
        inline: true
      }, {
        name: 'Dealer\'s Hand',
        value: `${cards['dealer'][0]['value']} of ${this.#capitalize(cards['dealer'][0]['suit'])}`,
        inline: true
      }, {
        name: '\u200B',
        value: '\u200B'
      }, {
        name: 'Your Value',
        value: this.#blackjackHandValue(cards['player'])[0],
        inline: true
      }, {
        name: 'Dealer\'s Value',
        value: this.#blackjackHandValue(cards['dealer'])[0],
        inline: true
      })
      
      const filter = i => buttons.filter(e => e.id === i.customId).length > 0 && i.member.user.id === interaction.user.id;
      const msg = await interaction.followUp({embeds: [embed], components: [row], fetchReply: true});
      const collector = msg.createMessageComponentCollector({filter, time: 2 * 60 * 1000});

      collector.on('collect', async i => {
        if (i.customId === 'Hit') {
          cards['player'].push(await this.#blackjackDrawCard(deck));
          embed.fields[0].value += `\n${cards['player'].at(-1)['value']} of ${this.#capitalize(cards['player'].at(-1)['suit'])}`;
          embed.fields[3].value = this.#blackjackHandValue(cards['player'])[0];

          if (this.#blackjackHandValue(cards['player'])[1] >= 21) {
            this.#blackjackDealersTurn(i, embed, row, user, interaction, cards, deck);
          } else {
            i.update({embeds: [embed]});
          }
        } else if (i.customId === 'Stand') {
          this.#blackjackDealersTurn(i, embed, row, user, interaction, cards, deck);
        }
      });
      collector.on('end', (collected, reason) => {
        switch (reason) {
          case 'time':
            return;
          case 'messageDelete':
            return;
          case 'channelDelete':
            return;
          case 'guildDelete':
            return;
          case 'limit':
            return;
          default:
            return interaction.channel.send({content: 'Game aborted due to an unknown reason'}).catch(console.error);
        }
      });
    } catch(err) {
      console.error(err);
      interaction.followUp({
        content: 'An unknown error occured whilst creating/playing a blackjack game, please try again later',
        ephemeral: true
      }).catch(console.error);
    }
  }
}

module.exports = {
  name: 'economy',
  aliases: ['deposit', 'withdraw', 'add-money', 'remove-money', 'give-money', 'stats', 'economy-leaderboard', 'work', 'crime', 'slot-machine', 'dice', 'blackjack'],
  async execute(interaction, prefix, command) {
    // the economy commands were heavily 'inspired' by unbelievaboat
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
        case 'give-money': {
          const embed = await Commands.giveMoney(userGuild, interaction);
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
        case 'blackjack':
          return Commands.blackjack(userGuild, interaction);
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