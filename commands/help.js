const fs = require('fs');

module.exports = {
  name: 'help',
  description: 'Shows all commands available, or a specified command',
  async execute(msg, args, Discord, prefix) {
    const json = JSON.parse(fs.readFileSync('./txt/help.json', 'utf8'));
    if (args[0]) {
      const command = json.find(element => element.command == args[0].toLowerCase());
      if (command) {
        const embed = new Discord.MessageEmbed()
        .setColor('#38d946')
        .setTitle(`Command: \`${prefix}${command.command}\``)
        .addField('Category', command.category.charAt(0).toUpperCase() + command.category.slice(1)),
        parameters = () => {
          if (command.parameters[0]) {
            var string = '';
            command.parameters.forEach(element => {
              string += `(*${element.required ? 'required' : 'optional'} parameter ${element.type}*) `;
            });
            return string.slice(0, -1);
          } else {
            return 'None';
          }
        },
        examples = () => {
          var string = '';
          command.examples.forEach(element => {
            string += `\`${prefix}${element}\`\n`;
          });
          return string;
        },
        categories = [
          {name: 'Parameters', value: parameters()},
          {name: 'Examples', value: examples()}
        ];

        categories.forEach(async element => await embed.addField(element.name, element.value));
        await msg.channel.send(embed);
      } else {
        await msg.channel.send('Requested command does not exist');
      }
    } else {
      const embed = new Discord.MessageEmbed()
      .setColor('#38d946')
      .setTitle('Command List')
      .setDescription(`A command list of all current available commands, in an organized order.\nUse \`${prefix}help CommandName\`, e.g \`${prefix}help users\` to get more information about a command, or alternatively, \`${prefix}desc CommandName\` for the description`)
      .addFields({
        name: 'Prefix',
        value: `In order to run commands with this bot, you need to use the \`${prefix}\` prefix before putting in the command.\nUnfortunately, customising the prefix is currently not available. It might get added in the future, it might not, who knows`
      }, {
        name: 'Support',
        value: fs.readFileSync('./txt/support.txt', 'utf8')
      }, {
        name: '\u200B',
        value: '\u200B'
      })
      .setFooter(`* means that parameters may be required, use ${prefix}help CommandName to view more information on that command`),
      categories = [
        {name: 'Utility', value: fieldValue(json, 'utility', prefix)},
        {name: 'Music', value: fieldValue(json, 'music', prefix)},
        {name: 'Memes', value: fieldValue(json, 'memes', prefix)},
        {name: 'Game Related', value: fieldValue(json, 'game related', prefix)},
        {name: 'Staff', value: fieldValue(json, 'staff', prefix)},
        {name: 'Other', value: fieldValue(json, 'other', prefix)}
      ];

      categories.forEach(async element => await embed.addField(element.name, element.value, true));
      await msg.channel.send(embed);
    }
  }
};
function fieldValue(json, type, prefix) {
  var string = '';

  json.forEach((element) => {
    if (element.category == type) {
      string += `\`${prefix}${element.command}${element.parameters[0] && element.parameters[0].required ? '*' : ''}\`, `;
    }
  });
  return string.slice(0, -2);
}