const connection = require('../db');
const dateFormat = require('dateformat');
const {MessageActionRow, MessageButton, MessageEmbed} = require('discord.js');

function getBlacklistedUser(userID) {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM Blacklist WHERE TargettedUserID = ?', [userID], (err, rows) => {
      if (err) reject(err);
      resolve(rows[0] ?? false);
    });
  });
}
function createBlacklistedUser({targettedID, creatorID, guildID, reason, creationDate}) {
  return new Promise((resolve, reject) => {
    const data = [targettedID, creatorID, guildID, reason, creationDate];
    connection.query('INSERT INTO Blacklist (TargettedUserID, CreatorUserID, GuildID, Reason, CreationDate) VALUES (?, ?, ?, ?, ?)', data, async err => {
      if (err) reject(err);
      try {
        const userData = await getBlacklistedUser(targettedID);
        resolve(userData);
      } catch(err2) {
        reject(err2);
      }
    });
  });
}
function deleteBlacklistedUser(userID) {
  return new Promise((resolve, reject) => {
    connection.query('DELETE FROM Blacklist WHERE TargettedUserID = ?', [userID], err => {
      if (err) reject(err);
      resolve();
    });
  });
}

module.exports = {
  name: 'blacklist',
  async execute(interaction) {
    try {
      if (!interaction.inGuild()) return interaction.reply({content: 'You must be in a server to use this command'});
      if (!interaction.member.permissions.has('MANAGE_GUILD')) return interaction.reply({content: 'You need the manage server pemission to run this command'});

      const member = interaction.options.getMember('user');
      if (member.user.bot) {
        const embed = new MessageEmbed()
        .setColor('RED')
        .setAuthor(interaction.user.tag, interaction.user.avatarURL())
        .setTitle('The Requested User is a Bot')
        .setDescription(`<@${member.id}> is a bot, you cannot blacklist them`)
        .setTimestamp();

        return interaction.reply({embeds: [embed], ephemeral: true});
      }
      if (interaction.user.id === member.id) {
        const embed = new MessageEmbed()
        .setColor('RED')
        .setAuthor(interaction.user.tag, interaction.user.avatarURL())
        .setTitle('You Cannot Blacklist/Whitelist Yourself')
        .setDescription('You are unable to blacklist/whitelist yourself')
        .setTimestamp();

        return interaction.reply({embeds: [embed], ephemeral: true});
      }

      if (interaction.options.getSubcommand() === 'add') {
        const reason = interaction.options.getString('reason');
        const isBlacklisted = await getBlacklistedUser(member.id);
        if (isBlacklisted) {
          const embed = new MessageEmbed()
          .setColor('RED')
          .setAuthor(interaction.user.tag, interaction.user.avatarURL())
          .setTitle('User is Already Blacklisted')
          .setDescription(`The user <@${member.id}> is already blacklisted from using NodeBot commands`)
          .addFields({
            name: 'Reason',
            value: isBlacklisted['Reason'],
            inline: true
          }, {
            name: 'Creation Date',
            value: `${dateFormat(isBlacklisted['CreationDate'], 'longDate')} at ${dateFormat(isBlacklisted['CreationDate'], 'isoTime')}`,
            inline: true
          }, {
            name: 'Blacklist By',
            value: `<@${isBlacklisted['CreatorUserID']}>`,
            inline: true
          })
          .setTimestamp();
  
          return interaction.reply({embeds: [embed], ephemeral: true});
        }
        if (reason.length > 255) {
          const embed = new MessageEmbed()
          .setColor('RED')
          .setAuthor(interaction.user.tag, interaction.user.avatarURL())
          .setTitle('Reason is Too Long')
          .setDescription('The reason must be less than 256 characters long')
          .setTimestamp();
  
          return interaction.reply({embeds: [embed], ephemeral: true});
        }
        
        const filter = i => (i.customId === 'Confirm' || i.customId === 'Abort') && i.user.id === interaction.member.id;
        const row = new MessageActionRow()
        .addComponents(
          new MessageButton()
          .setCustomId('Confirm')
          .setEmoji('✔️')
          .setStyle('SUCCESS'),
          new MessageButton()
          .setCustomId('Abort')
          .setEmoji('❌')
          .setStyle('DANGER')
        );
        const embed = new MessageEmbed()
        .setColor('RANDOM')
        .setAuthor(interaction.user.tag, interaction.user.avatarURL())
        .setTitle('Blacklist Confirmation')
        .setDescription(`Are you sure you want to blacklist <@${member.id}> for the following reason: ${reason}?`)
        .setTimestamp();
  
        const confirmation = await interaction.reply({
          embeds: [embed],
          components: [row],
          fetchReply: true
        });
  
        confirmation.awaitMessageComponent({filter, time: 10 * 1000}).then(async i => {
          const reaction = i.customId;
          if (reaction === 'Confirm') {
            try {
              await createBlacklistedUser({
                targettedID: member.id,
                creatorID: interaction.user.id,
                guildID: interaction.guildId,
                reason: reason,
                creationDate: dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss')
              });

              embed.title = 'User Successfully Blacklisted';
              embed.description = `<@${member.id}> has successfully been blacklisted from using NodeBot commands!`;

              i.update({
                embeds: [embed],
                components: []
              })
            } catch(err) {
              embed.title = 'An Error Occured';
              embed.description = 'An unknown error occured whilst trying to blacklist, please try again later';

              i.update({
                embeds: [embed],
                components: []
              })
            }
          } else {
            embed.title = 'Blacklist Aborted';
            embed.description = `The blacklist on <@${member.id}> has been aborted`;
  
            i.update({
              embeds: [embed],
              components: []
            });
          }
        })
        .catch(console.error);
      } else if (interaction.options.getSubcommand() === 'remove') {
        const isBlacklisted = await getBlacklistedUser(member.id);
        if (!isBlacklisted) {
          const embed = new MessageEmbed()
          .setColor('RED')
          .setAuthor(interaction.user.tag, interaction.user.avatarURL())
          .setTitle('User is Not Blacklisted')
          .setDescription(`The user <@${member.id}> is not blacklisted`)
          .setTimestamp();
  
          return interaction.reply({embeds: [embed], ephemeral: true});
        }

        await deleteBlacklistedUser(member.id);
        const embed = new MessageEmbed()
        .setColor('GREEN')
        .setAuthor(interaction.user.tag, interaction.user.avatarURL())
        .setTitle('User Successfully Whitelisted')
        .setDescription(`The user <@${member.id}> has successfully been whitelisted, they can now use NodeBot commands again!`)
        .setTimestamp();

        interaction.reply({embeds: [embed]});
      }
    } catch(err) {
      console.error(err);
      interaction.reply({
        content: 'An unknown error occured, please try again later',
        ephemeral: true
      });
    }
  }
}