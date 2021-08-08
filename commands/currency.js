const fs = require('fs');
const dateFormat = require('dateformat');
const connection = require('../db');
const {MessageEmbed} = require('discord.js');

class User {
  static userInfo(id) {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM CurrencyUsers WHERE UserID = ?', [id], (err, rows) => {
        if (err) reject(err);
        resolve(rows[0] ?? false);
      });
    });
  }
  static createUser({id, creationDate, userCreationDate}) {
    return new Promise((resolve, reject) => {
      /*
        CurrencyUsers:
        ID, UserID, CreationDate, UserCreationDate
      */
      const data = [id, creationDate, userCreationDate]; 
      connection.query('INSERT INTO CurrencyUsers (UserID, CreationDate, UserCreationDate) VALUES (?, ?, ?)', data, async (err, rows) => {
        if (err) reject(err);

        try {
          const userData = await this.userInfo(id);
          resolve(userData);
        } catch(err) {
          reject(err);
        }
      });
    });
  }
}
class Guild {
  static userInfo(userID, guildID) {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM CurrencyGuilds WHERE UserID = ? AND GuildID = ?', [userID, guildID], (err, rows) => {
        if (err) reject(err);
        resolve(rows[0] ?? false);
      });
    });
  }

  static createGuildUser({userID, guildID, creationDate}) {
    return new Promise((resolve, reject) => {
      /*
        CurrencyGuilds:
        ID, UserID, GuildID, CreationDate, Cash, Bank
      */
      const data = [userID, guildID, creationDate];
      connection.query('INSERT INTO CurrencyGuilds (UserID, GuildID, CreationDate, Cash, Bank) VALUES (?, ?, ?, 1000, 0)', data, async (err, rows) => {
        if (err) reject(err);

        try {
          const userGuildData = await this.userInfo(userID, guildID);
          resolve(userGuildData);
        } catch(err) {
          reject(err);
        }
      });
    });
  }

  static updateCash(id, amount) {
    return new Promise((resolve, reject) => {
      connection.query('UPDATE CurrencyGuilds SET Cash = ? WHERE ID = ?', [amount, id], (err, rows) => {
        if (err) reject(err);
        resolve(amount);
      });
    });
  }
}
class Commands {
  static work(user) {
    return new Promise(async (resolve, reject) => {
      try {
        const amount = Math.floor(Math.random() * 200) + 300;
        const file = JSON.parse(fs.readFileSync('./currency/work.json', 'utf8'));
        const random = file[Math.floor(Math.random() * file.length)];
        const message = random.replace(new RegExp('{amount}', 'g'), amount);
        
        await Guild.updateCash(user['ID'], user['Cash'] + amount);
        resolve(message);
      } catch(err) {
        reject(err);
      }
    });
  }
}

module.exports = {
  name: 'currency',
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
        case 'work': {
          const message = await Commands.work(userGuild);
          return interaction.reply({content: message});
        }
      }
    } catch(err) {
      console.error(err);
      interaction.reply({
        content: 'An error occured, please try again later',
        ephemeral: true
      }).catch(console.error);
    }
  }
}