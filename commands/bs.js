const fs = require('fs');

module.exports = {
  name: 'bs',
  description: 'Damn, some bullshit that we have to stare at',
  async execute(msg, args, Discord) {
    // how to add a local image to an embed:
    // 1: make an attachment
    // 2: add setImage method to embed with the string: 'attachment://imagePath'
    // 3: when sending the image add a files property with the value as an array with the attachment

    const files = await fs.readdirSync('./pictures/bs');
    const image = files[Math.floor(Math.random() * files.length)];
    const attachment = new Discord.MessageAttachment(`pictures/bs/${image}`);
    const embed = new Discord.MessageEmbed()
    .setColor('#52fa5c')
    .setTitle('Bullshit')
    .setDescription('Look at that bullshit')
    .setImage(`attachment://${image}`)
    .setFooter('Damn, that\'s crazy');

    msg.channel.send({embeds: [embed], files: [attachment]}).catch(console.error)
  }
}