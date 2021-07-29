const fs = require('fs');

// reduce makes the code shorter but a bit harder to read, its a worthy sacrifice
function parameters(command) {
  if (!command.parameters[0]) return 'None';
  return command.parameters.reduce((acc, curr) => {
    // example: (required parameter Steam ID)
    return acc + `(*${curr.required ? 'required' : 'optional'} parameter ${curr.type}*) `;
  }, '').slice(0, -1);
}
function examples(command, prefix) {
  return command.examples.reduce((acc, curr) => {
    // example: ..!csgo noprofilephoto
    return acc + `\`${prefix}${curr}\`\n`;
  }, '');
}
function fieldValue(json, type, prefix) {
  return json.reduce((acc, curr) => {
    // example: ..!csgo*, ..!support
    if (curr.category == type) return acc + `\`${prefix}${curr.command}${curr.parameters[0]?.required ? '*' : ''}\`, `;
    else return acc;
  }, '').slice(0, -2);
}

module.exports = {
  name: 'help',
  description: 'Shows all available commands, or a specified command',
  async execute(msg, args, Discord, prefix) {
    const json = await JSON.parse(fs.readFileSync('./txt/help.json', 'utf8'));
    if (args[0]) {
      const command = json.find(val => val.command == args[0].toLowerCase());
      if (!command) return msg.reply('Requested command does not exist').catch(console.error);

      const categoryName = command.category.charAt(0).toUpperCase() + command.category.slice(1);
      const embed = new Discord.MessageEmbed()
      .setColor('#38d946')
      .setTitle(`Command: \`${prefix}${command.command}\``)
      .addField('Category', categoryName);
      const categories = [
        {name: 'Parameters', value: parameters(command)},
        {name: 'Examples', value: examples(command, prefix)}
      ];

      categories.forEach(curr => embed.addField(curr.name, curr.value));
      msg.channel.send({embeds: [embed]}).catch(console.error);
    } else {
      const embed = new Discord.MessageEmbed()
      .setColor('#38d946')
      .setTitle('Command List')
      .setDescription(`A command list of all current available commands, in an organized order.\nUse \`${prefix}help CommandName\`, e.g \`${prefix}help users\` to get more information about the command, or alternatively, \`${prefix}desc CommandName\` for the description`)
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
      .setFooter(`* means that parameters may be required, use ${prefix}help CommandName to view more information on that command`);
      const categories = [
        {name: 'Utility', value: fieldValue(json, 'utility', prefix)},
        {name: 'Music', value: fieldValue(json, 'music', prefix)},
        {name: 'Memes', value: fieldValue(json, 'memes', prefix)},
        {name: 'Game Related', value: fieldValue(json, 'game related', prefix)},
        {name: 'Staff', value: fieldValue(json, 'staff', prefix)},
        {name: 'Other', value: fieldValue(json, 'other', prefix)}
      ];

      categories.forEach(curr => embed.addField(curr.name, curr.value, true));
      msg.reply({embeds: [embed]}).catch(console.error);
    }
  }
};