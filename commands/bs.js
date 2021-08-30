const {readdirSync} = require('fs');
const {MessageAttachment, MessageEmbed} = require('discord.js');

module.exports = {
  data: {
    name: "bs",
    description: "Damn, some bs we have to stare at. Contains sensitive language and is restricted to NSFW channels",
    category: "memes",
    options: [],
    examples: [
      "bs"
    ]
  },
  execute(interaction) {
    // how to add a local image to an embed:
    // 1: make an attachment
    // 2: add setImage method to embed with the string: 'attachment://imagePath'
    // 3: when sending the image add a files property with the value as an array with the attachment

    if (interaction.channel?.type !== 'DM' && !interaction.channel.nsfw) return interaction.reply({content: 'The channel must be marked as NSFW for this command to work'}).catch(console.error);
    const files = readdirSync('./pictures/bs');
    const image = files[Math.floor(Math.random() * files.length)];
    const attachment = new MessageAttachment(`pictures/bs/${image}`);
    const embed = new MessageEmbed()
    .setColor('#52fa5c')
    .setTitle('Bullshit')
    .setDescription('Look at that bullshit')
    .setImage(`attachment://${image}`)
    .setFooter('Damn, that\'s crazy');

    interaction.reply({
      embeds: [embed],
      files: [attachment]
    }).catch(console.error);
  }
}