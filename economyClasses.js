const connection = require('./db');
const dateFormat = require('dateformat');
const {MessageEmbed} = require('discord.js');

class User {
  static userInfo(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const [rows] = await connection.execute('SELECT * FROM EconomyUsers WHERE UserID = ?', [id]);
        resolve(rows[0] ?? false);
      } catch(err) {
        reject(err);
      }
    });
  }
  static createUser({id, creationDate}) {
    return new Promise(async (resolve, reject) => {
      /*
        EconomyUsers:
        ID, UserID, CreationDate
      */
      try {
        const data = [id, creationDate]; 
        await connection.execute('INSERT INTO EconomyUsers (UserID, CreationDate) VALUES (?, ?)', data);

        const userData = await this.userInfo(id);
        resolve(userData);
      } catch(err) {
        reject(err);
      }
    });
  }
}
class Guild {
  static #bitLimit = Math.floor(2147483647 / 2);

  // cash and bank are 32 bit, so we have to make sure it doesnt go above half of 32 bit
  static #preventLimit(amount) {
    if (Math.abs(amount) > this.#bitLimit) return amount > 0 ? this.#bitLimit : -this.#bitLimit;
    else return amount;
  }

  static userInfo(userID, guildID) {
    return new Promise(async (resolve, reject) => {
      try {
        const [rows] = await connection.execute('SELECT * FROM EconomyGuilds WHERE UserID = ? AND GuildID = ?', [userID, guildID]);
        resolve(rows[0] ?? false);
      } catch(err) {
        reject(err);
      }
    });
  }

  static createGuildUser({userID, guildID}) {
    return new Promise(async (resolve, reject) => {
      /*
        EconomyGuilds:
        ID, UserID, GuildID, Cash, Bank
      */
      try {
        const data = [userID, guildID];
        await connection.execute('INSERT INTO EconomyGuilds (UserID, GuildID, Cash, Bank) VALUES (?, ?, 1000, 0)', data);

        const userGuildData = await this.userInfo(userID, guildID);
        resolve(userGuildData);
      } catch(err) {
        reject(err);
      }
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
          user = await User.createUser({
            id: userID,
            creationDate: creationDate
          });
        }
        if (!userGuild) {
          userGuild = await this.createGuildUser({
            userID: userID,
            guildID: guildID
          });
        }

        resolve({user: user, userGuild: userGuild});
      } catch(err) {
        reject(err);
      }
    });
  }

  static updateCash(id, amount) {
    return new Promise(async (resolve, reject) => {
      try {
        amount = this.#preventLimit(amount);
        await connection.execute('UPDATE EconomyGuilds SET Cash = ? WHERE ID = ?', [amount, id]);
        resolve(amount);
      } catch(err) {
        reject(err);
      }
    });
  }

  static updateBank(id, amount) {
    return new Promise(async (resolve, reject) => {
      try {
        amount = this.#preventLimit(amount);
        await connection.execute('UPDATE EconomyGuilds SET Bank = ? WHERE ID = ?', [amount, id]);
        resolve(amount);
      } catch(err) {
        reject(err);
      }
    });
  }

  static userStats(interaction, id) {
    return new Promise(async (resolve, reject) => {
      try {
        const [rows] = await connection.execute('SELECT Cash, Bank FROM EconomyGuilds WHERE ID = ?', [id]);
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
      } catch(err) {
        reject(err);
      }
    });
  }

  static guildList(guildID, limit = 5) {
    return new Promise(async (resolve, reject) => {
      try {
        const [rows] = await connection.execute('SELECT * FROM EconomyGuilds WHERE GuildID = ? LIMIT ?', [guildID, limit]);
        resolve(rows);
      } catch(err) {
        reject(err);
      }
    });
  }
}
class Commands {
  static capitalize(word) {
    const lowercase = word.toLowerCase();
    return lowercase.charAt(0).toUpperCase() + lowercase.slice(1);
  }

  static validateCash(interaction, user) {
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

  static validateBank(interaction, user) {
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
}

function check(interaction) {
  return new Promise(async (resolve, reject) => {
    if (!interaction.inGuild()) reject({content: 'You must be in a server to use this command', ephemeral: true});
    if (!interaction.guild.me.permissions.has('USE_EXTERNAL_EMOJIS')) reject({content: 'I need the use external emojis permission to run currency commands'});

    const {userGuild} = await Guild.createUserIfDoesntExist(interaction.member, interaction.guildId);
    resolve(userGuild);
  });
}

module.exports = {User, Guild, Commands, check}