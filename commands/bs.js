const fs = require('fs');

module.exports = {
  name: 'bs',
  description: 'Damn, some bullshit that we have to stare at',
  execute(msg, args, Discord) {
    fs.readdir('./pictures/bs', async err => {
      if (!err) {
        let files = await fs.readdirSync('./pictures/bs'),
        image = files[Math.floor(Math.random() * files.length)],
        embed = new Discord.MessageEmbed()
        .setColor('#52fa5c')
        .setTitle('Bullshit')
        .setDescription('Look at that bullshit')
        .attachFiles(new Discord.MessageAttachment(`pictures/bs/${image}`, `${image}`))
        .setImage(`attachment://${image}`)
        .setFooter('Damn, that\'s crazy');
        
        await msg.channel.send(embed);
      } else {
        await msg.channel.send('Error encountered, please try again later');
      }
    });
  }
};