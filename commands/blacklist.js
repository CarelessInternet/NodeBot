const connection = require('../db');
const dateFormat = require('dateformat');
const {MessageActionRow, MessageButton, MessageEmbed} = require('discord.js');

function getBlacklistedUser(userID, guildID) {
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM Blacklist WHERE TargettedUserID = ? AND GuildID = ?', [userID, guildID], (err, rows) => {
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
        const userData = await getBlacklistedUser(targettedID, guildID);
        resolve(userData);
      } catch(err2) {
        reject(err2);
      }
    });
  });
}
function deleteBlacklistedUser(userID, guildID) {
  return new Promise((resolve, reject) => {
    connection.query('DELETE FROM Blacklist WHERE TargettedUserID = ? AND GuildID = ?', [userID, guildID], err => {
      if (err) reject(err);
      resolve();
    });
  });
}
function getAllBlacklistedUsers(guildID, page = 0) {
  return new Promise((resolve, reject) => {
    // limit 10 results, offset by page amount
    connection.query('SELECT * FROM Blacklist WHERE GuildID = ? ORDER BY ID LIMIT 10 OFFSET ?', [guildID, page * 10], (err, rows) =>{
      if (err) reject(err);
      resolve(rows);
    });
  });
}

module.exports = {
  name: 'blacklist',
  async execute(interaction) {
    try {
      if (!interaction.inGuild()) return interaction.reply({content: 'You must be in a server to use this command'});
      if (!interaction.member.permissions.has('MANAGE_CHANNELS')) return interaction.reply({content: 'You need the manage channels pemission to run this command'});

      const member = interaction.options.getMember('user');
      if (member?.user.bot) {
        const embed = new MessageEmbed()
        .setColor('RED')
        .setAuthor(interaction.user.tag, interaction.user.avatarURL())
        .setTitle('The Requested User is a Bot')
        .setDescription(`<@${member.id}> is a bot, you cannot blacklist/whitelist them`)
        .setTimestamp();

        return interaction.reply({embeds: [embed], ephemeral: true});
      }

      if (interaction.options.getSubcommand() === 'add') {
        const reason = interaction.options.getString('reason');
        const isBlacklisted = await getBlacklistedUser(member.id, interaction.guildId);

        if (isBlacklisted && !member.permissions.has('MANAGE_CHANNELS')) {
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
            name: 'Blacklist Date',
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
        if (member.permissions.has('MANAGE_CHANNELS')) {
          const embed = new MessageEmbed()
          .setColor('RED')
          .setAuthor(interaction.user.tag, interaction.user.avatarURL())
          .setTitle('The User has High Permissions')
          .setDescription(`The user <@${member.id}> has the manage channels permission, meaning that you cannot blacklist them`)
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
        .setDescription(`Are you sure you want to blacklist <@${member.id}> from using NodeBot commands for the following reason: ${reason}?`)
        .setTimestamp();
  
        const confirmation = await interaction.reply({
          embeds: [embed],
          components: [row],
          fetchReply: true
        });
        // we use this instead of awaitMessageComponent to get the reason and reply accordingly
        const collector = confirmation.createMessageComponentCollector({filter, max: 1, time: 10 * 1000});

        collector.on('collect', async i => {
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
            } catch(err) {
              console.error(err);
              embed.title = 'An Error Occured';
              embed.description = 'An unknown error occured whilst trying to blacklist, please try again later';
            }
          } else {
            embed.title = 'Blacklist Aborted';
            embed.description = `The blacklist on <@${member.id}> has been aborted`;
          }
          
          i.update({
            embeds: [embed],
            components: []
          });
        });
        collector.on('end', (collected, reason) => {
          switch (reason) {
            case 'time': {
              embed.title = 'Blacklist Aborted';
              embed.description = `The blacklist on <@${member.id}> has been aborted`;
              return confirmation.edit({embeds: [embed], components: []}).catch(console.error);
            }
            case 'messageDelete':
              return interaction.channel.send({content: 'Blacklist aborted because the message was deleted'}).catch(console.error);
            case 'channelDelete':
              return;
            case 'guildDelete':
              return;
            case 'limit':
              return;
            default:
              return interaction.channel.send({content: 'Kick aborted due to an unknown reason'}).catch(console.error);
          }
        });
      } else if (interaction.options.getSubcommand() === 'remove') {
        const isBlacklisted = await getBlacklistedUser(member.id, interaction.guildId);
        if (!isBlacklisted) {
          const embed = new MessageEmbed()
          .setColor('RED')
          .setAuthor(interaction.user.tag, interaction.user.avatarURL())
          .setTitle('User is Not Blacklisted')
          .setDescription(`The user <@${member.id}> is not blacklisted`)
          .setTimestamp();
  
          return interaction.reply({embeds: [embed], ephemeral: true});
        }

        const embed = new MessageEmbed()
        .setColor('GREEN')
        .setAuthor(interaction.user.tag, interaction.user.avatarURL())
        .setTitle('User Successfully Whitelisted')
        .setDescription(`The user <@${member.id}> has successfully been whitelisted, they can now use NodeBot commands again!`)
        .setTimestamp();

        try {
          await deleteBlacklistedUser(member.id, interaction.guildId);
          embed.title = 'User Successfully Whitelisted';
          embed.description = `The user <@${member.id}> has successfully been whitelisted, they can now use NodeBot commands again!`;
        } catch(err) {
          console.error(err);
          embed.title = 'An Error Occured';
          embed.description = 'An unknown error occured, please try again later';
        }

        interaction.reply({embeds: [embed]});
      } else if (interaction.options.getSubcommand() === 'list') {
        const page = interaction.options.getInteger('page') ?? 0;
        const list = await getAllBlacklistedUsers(interaction.guildId, page);
        const embed = new MessageEmbed()
        .setColor('RANDOM')
        .setAuthor(interaction.user.tag, interaction.user.avatarURL())
        .setTitle('Blacklisted Members')
        .setDescription('Shows all of the blacklisted members in this server')
        .setTimestamp()
        .setFooter(`Page: ${page || 1}`);

        if (list.length) {
          list.forEach((val, index) => {
            let string = `To: <@${val['TargettedUserID']}>\n`;
            string += `By: <@${val['CreatorUserID']}>\n`
            string += `Blacklist Date: ${dateFormat(val['CreationDate'], 'longDate')} at ${dateFormat(val['CreationDate'], 'isoTime')}\n`;
            string += `Reason: ${val['Reason']}`;
  
            embed.addField((index + 1).toLocaleString(), string);
          });
        } else {
          embed.addField('No Results', 'No results were found');
        }

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