const fs = require('fs');
const fg = require('fast-glob');
const {MessageEmbed, MessageActionRow, MessageButton} = require('discord.js');
const optionType = require('../info/data-options');

function description(command) {
  return `${command.description || 'No description'}`;
}
function options(command) {
  if (!command.options[0]) return 'None';
  return command.options.reduce((acc, curr) => {
    return acc + `[*${curr.required ? 'required' : 'optional'} option ${optionType.get(curr.type)}*]\n**${curr.description}**\n`;
  }, '');
}
function examples(command, prefix) {
  return command.examples.reduce((acc, curr) => {
    return acc + `\`${prefix}${curr}\`\n`;
  }, '');
}
function fieldValue(json, type, prefix) {
  return json.reduce((acc, curr) => {
    if (curr.category == type) return acc + `\`${prefix}${curr.name}${curr.options[0]?.required ? '*' : ''}\`, `;
    else return acc;
  }, '').slice(0, -2) || '`Empty`';
}

module.exports = {
  data: {
    name: "help",
    description: "Shows all available commands, or information about a specified command",
    category: "utility",
    options: [
      {
        name: "command",
        description: "A specific command to get information about",
        type: 3,
        required: false
      }
    ],
    examples: [
      "help",
      "help mc",
      "help rps",
      "help help"
    ]
  },
  async execute(interaction, prefix) {
    const files = await fg('./commands/**/*.js', {dot: true});
    const guildCommands = [];
    const commands = files.reduce((acc, file) => {
      const {data} = require(`../${file}`);
      if (!data.guild) acc.push(data);
      else guildCommands.push(data);
      return acc;
    }, []);
    const arg = interaction.options.getString('command');

    if (arg) {
      const command = commands.find(val => val.name == arg.toLowerCase()) || (interaction.guildId === process.env.guildID ? guildCommands.find(file => file.name === arg.toLowerCase()) : false);
      if (!command) return interaction.reply({
        content: 'Requested command does not exist',
        ephemeral: true
      }).catch(console.error);
      if (command.name && (command.type === 2 || command.type === 3) && !command.description && !command.options) return interaction.reply({content: 'This is a context menu command, information cannot be given about it', ephemeral: true});

      const categoryName = command.category == 'game' ? 'Game Related' : command.category.charAt(0).toUpperCase() + command.category.slice(1);
      const embed = new MessageEmbed()
      .setColor('RANDOM')
      .setTitle(`Command: \`${prefix}${command.name}\``)
      .addField('Category', categoryName);
      const categories = [
        {
          name: 'Description',
          value: description(command)
        },
        {
          name: 'Options',
          value: options(command)
        },
        {
          name: 'Examples',
          value: examples(command, prefix)
        }
      ];
      
      categories.forEach(curr => embed.addField(curr.name, curr.value));
      interaction.reply({embeds: [embed]}).catch(console.error);
    } else {
      const embed = new MessageEmbed()
      .setColor('RANDOM')
      .setTitle('Command List')
      .setDescription(`A command list of all current available commands, in an organized order.\nUse \`${prefix}help CommandName\`, e.g \`${prefix}help users\` to get more information about the command`)
      .addFields({
        name: 'Prefix',
        value: `In order to run commands with this bot, you need to use the \`${prefix}\` prefix before putting in the command. Custom prefixes aren't available with me, since message content will be [deprecated in April 2022](https://support-dev.discord.com/hc/en-us/articles/4404772028055)`
      }, {
        name: 'Support',
        value: fs.readFileSync('./info/support.txt', 'utf8')
      }, {
        name: 'Invite',
        value: fs.readFileSync('./info/invite.txt', 'utf8')
      }, {
        name: '\u200B',
        value: '\u200B'
      })
      .setFooter(`* means that options may be required, use ${prefix}help CommandName to view more information on that command`)
      .setTimestamp();

      if (interaction.guildId === process.env.guildID) guildCommands.forEach(file => commands.push(file));
      const categories = [
        {
          name: 'Utility',
          value: fieldValue(commands, 'utility', prefix)
        },
        {
          name: 'Music',
          value: fieldValue(commands, 'music', prefix)
        },
        {
          name: 'Memes',
          value: fieldValue(commands, 'memes', prefix)
        },
        {
          name: 'Game Related',
          value: fieldValue(commands, 'game', prefix)
        },
        {
          name: 'Economy',
          value: fieldValue(commands, 'economy', prefix)
        },
        {
          name: 'Staff',
          value: fieldValue(commands, 'staff', prefix)
        },
        {
          name: 'Other',
          value: fieldValue(commands, 'other', prefix)
        }
      ];

      categories.forEach(curr => embed.addField(curr.name, curr.value, true));
      if (process.env.topGGToken) {
        const row = new MessageActionRow()
        .addComponents(
          new MessageButton()
          .setLabel('Vote for Me')
          .setURL(`https://top.gg/bot/${process.env.clientID}/vote`)
          .setStyle('LINK')
        );

        interaction.reply({embeds: [embed], components: [row]}).catch(console.error);
      } else {
        interaction.reply({embeds: [embed]}).catch(console.error); 
      }
    }
  }
}