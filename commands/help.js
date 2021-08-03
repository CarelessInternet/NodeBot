const fs = require('fs');
const {MessageEmbed, MessageActionRow, MessageButton} = require('discord.js');

function options(command) {
  if (!command.options[0]) return 'None';
  return command.options.reduce((acc, curr) => {
    return acc + `[*${curr.required ? 'required' : 'optional'} option ${curr.type}*] `;
  }, '').slice(0, -1);
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
  name: 'help',
  execute(interaction, prefix) {
    const json = JSON.parse(fs.readFileSync('./txt/data.json', 'utf8'));
    const arg = interaction.options.get('command')?.value;
    if (arg) {
      const command = json.find(val => val.name == arg.toLowerCase());
      if (!command) return interaction.reply({
        content: 'Requested command does not exist',
        ephemeral: true
      }).catch(console.error);

      const categoryName = command.category == 'game' ? 'Game Related' : command.category.charAt(0).toUpperCase() + command.category.slice(1);
      const embed = new MessageEmbed()
      .setColor('RANDOM')
      .setTitle(`Command: \`${prefix}${command.name}\``)
      .addField('Category', categoryName);
      const categories = [
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
        value: `In order to run commands with this bot, you need to use the \`${prefix}\` prefix before putting in the command.\nCustom prefixes aren't available with me, since they will be [deprecated in April 2022](https://support-dev.discord.com/hc/en-us/articles/4404772028055)`
      }, {
        name: 'Support',
        value: fs.readFileSync('./txt/support.txt', 'utf8')
      }, {
        name: '\u200B',
        value: '\u200B'
      })
      .setFooter(`* means that options may be required, use ${prefix}help CommandName to view more information on that command`);
      const categories = [
        {
          name: 'Utility',
          value: fieldValue(json, 'utility', prefix)
        },
        {
          name: 'Music',
          value: fieldValue(json, 'music', prefix)
        },
        {
          name: 'Memes',
          value: fieldValue(json, 'memes', prefix)
        },
        {
          name: 'Game Related',
          value: fieldValue(json, 'game', prefix)
        },
        {
          name: 'Staff',
          value: fieldValue(json, 'staff', prefix)
        },
        {
          name: 'Other',
          value: fieldValue(json, 'other', prefix)
        }
      ];

      const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
        .setLabel('Vote for Me')
        .setURL('https://top.gg/bot/507915396037214208')
        .setStyle('LINK')
      );

      categories.forEach(curr => embed.addField(curr.name, curr.value, true));
      interaction.reply({
        embeds: [embed],
        components: [row]
      }).catch(console.error);
    }
  }
}