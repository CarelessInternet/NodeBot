const connection = require('../db');
const dateFormat = require('dateformat');
const {MessageActionRow, MessageButton, MessageEmbed} = require('discord.js');

function getBlacklistedUser(userID, guildID) {
  return new Promise(async (resolve, reject) => {
    try {
      const [rows] = await connection.execute('SELECT * FROM Blacklist WHERE TargettedUserID = ? AND GuildID = ?', [userID, guildID]);
      resolve(rows[0] ?? false);
    } catch(err) {
      reject(err);
    }
  });
}
function createBlacklistedUser({targettedID, creatorID, guildID, reason, creationDate}) {
  return new Promise(async (resolve, reject) => {
    try {
      const data = [targettedID, creatorID, guildID, reason, creationDate];
      await connection.execute('INSERT INTO Blacklist (TargettedUserID, CreatorUserID, GuildID, Reason, CreationDate) VALUES (?, ?, ?, ?, ?)', data);
      const userData = await getBlacklistedUser(targettedID, guildID);
      resolve(userData);
    } catch(err) {
      reject(err);
    }
  });
}
function deleteBlacklistedUser(userID, guildID) {
  return new Promise(async (resolve, reject) => {
    try {
      await connection.execute('DELETE FROM Blacklist WHERE TargettedUserID = ? AND GuildID = ?', [userID, guildID]);
      resolve();
    } catch(err) {
      reject(err);
    }
  });
}
function getAllBlacklistedUsers(guildID, page = 0) {
  return new Promise(async (resolve, reject) => {
    // limit 10 results, offset by page amount
    try {
      if (page !== 0) page -= 1;
      const [rows] = await connection.execute('SELECT * FROM Blacklist WHERE GuildID = ? ORDER BY ID LIMIT 10 OFFSET ?', [guildID, page * 10]);
      resolve(rows);
    } catch(err) {
      reject(err);
    }
  });
}

module.exports = {
  data: {
    name: "blacklist",
    description: "Blacklists a member from using NodeBot commands",
    category: "staff",
    options: [
      {
        name: "add",
        description: "Add a member to the blacklist",
        type: 1,
        options: [
          {
            name: "user",
            description: "The user you want to blacklist",
            type: 6,
            required: true
          },
          {
            name: "reason",
            description: "The reason you want to blacklist the user",
            type: 3,
            required: true
          }
        ]
      },
      {
        name: "remove",
        description: "Remove a member from the blacklist",
        type: 1,
        options: [
          {
            name: "user",
            description: "The user you want to remove from the blacklist",
            type: 6,
            required: true
          }
        ]
      },
      {
        name: "list",
        description: "The list of blacklisted members",
        type: 1,
        options: [
          {
            name: "page",
            description: "The page you want to see",
            type: 4,
            required: false
          }
        ]
      }
    ],
    examples: [
      "blacklist add @CarelessInternet#8114 sample reason",
      "blacklist add @johndoe#0001 why r u gae",
      "blacklist remove @deeznuts#6969",
      "blacklist remove @sssss#1234"
    ]
  },
  async execute(interaction) {
    try {
      if (!interaction.inGuild()) return interaction.reply({content: 'You must be in a server to use this command'});
      if (!interaction.member.permissions.has('MANAGE_CHANNELS')) return interaction.reply({content: 'You need the manage channels pemission to run this command'});

      const member = interaction.options.getMember('user');
      if (member?.user.bot) {
        const embed = new MessageEmbed()
        .setColor('RED')
        .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL())
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
          .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL())
          .setTitle('User is Already Blacklisted')
          .setDescription(`The user <@${member.id}> is already blacklisted from using NodeBot commands`)
          .addFields({
            name: 'Reason',
            value: isBlacklisted['Reason'],
            inline: true
          }, {
            name: 'Blacklist Date',
            value: `<t:${Math.floor(new Date(isBlacklisted['CreationDate'].getTime() / 1000))}>`,
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
          .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL())
          .setTitle('The User has High Permissions')
          .setDescription(`The user <@${member.id}> has the manage channels permission, meaning that you cannot blacklist them`)
          .setTimestamp();
  
          return interaction.reply({embeds: [embed], ephemeral: true});
        }
        if (interaction.user.id === member.id) {
          const embed = new MessageEmbed()
          .setColor('RED')
          .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL())
          .setTitle('You Cannot Blacklist/Whitelist Yourself')
          .setDescription('You are unable to blacklist/whitelist yourself')
          .setTimestamp();
  
          return interaction.reply({embeds: [embed], ephemeral: true});
        }
        if (reason.length > 255) {
          const embed = new MessageEmbed()
          .setColor('RED')
          .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL())
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
        .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL())
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
          .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL())
          .setTitle('User is Not Blacklisted')
          .setDescription(`The user <@${member.id}> is not blacklisted`)
          .setTimestamp();
  
          return interaction.reply({embeds: [embed], ephemeral: true});
        }

        const embed = new MessageEmbed()
        .setColor('GREEN')
        .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL())
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
        .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL())
        .setTitle('Blacklisted Members')
        .setDescription('Shows all of the blacklisted members in this server')
        .setTimestamp()
        .setFooter(`Page: ${page || 1}`);

        if (list.length) {
          list.forEach((val, index) => {
            let string = `To: <@${val['TargettedUserID']}>\n`;
            string += `By: <@${val['CreatorUserID']}>\n`
            string += `Blacklist Date: <t:${Math.floor(new Date(val['CreationDate'].getTime() / 1000))}>\n`;
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