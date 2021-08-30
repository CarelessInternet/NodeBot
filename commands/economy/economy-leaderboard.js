const {Guild, check} = require('../../economyClasses');
const {MessageEmbed} = require('discord.js');

function leaderboard(interaction) {
  return new Promise(async (resolve, reject) => {
    try {
      const guildID = interaction.guildId;
      const guildMembers = await Guild.guildList(guildID);
      guildMembers.sort((a, b) => {
        if (a['Cash'] + a['Bank'] < b['Cash'] + b['Bank']) return 1;
        if (a['Cash'] + a['Bank'] > b['Cash'] + b['Bank']) return -1;
        return 0;
      });

      const embed = new MessageEmbed()
      .setColor('RANDOM')
      .setTitle(`${interaction.guild.name} Leaderboard`)
      .setDescription(`💰 The current economy leaderboard of ${interaction.guild.name}`)
      .setTimestamp()
      .setFooter('This command only displays, at most the top 5 users in the guild');

      for (let i = 0; i < guildMembers.length; i++) {
        const user = guildMembers[i];

        // fetch by shard because we are using sharding, and not every user will be in one shard, so we have to get the one which has it
        // because the user might have left the server, so we cant use interaction.guild.members.fetch()
        // since they wont be in the guild members list
        const member = await interaction.client.shard.broadcastEval((client, id) => client.users.fetch(id), {context: user['UserID']});
        embed.addField(`${i + 1}: ${member[0].tag}`, `💵 Cash: ${user['Cash'].toLocaleString()}\n💸 Bank: ${user['Bank'].toLocaleString()}`);
      }

      resolve({embeds: [embed]});
    } catch(err) {
      reject(err);
    }
  });
}

module.exports = {
  data: {
    name: "economy-leaderboard",
    description: "Displays the economy leaderboard of the guild",
    category: "economy",
    options: [],
    examples: [
      "economy-leaderboard"
    ]
  },
  async execute(interaction) {
    try {
      const userGuild = await check(interaction);
      const embed = await leaderboard(interaction);
      interaction.reply(embed);
    } catch(err) {
      console.error(err);
      interaction.reply({content: 'An unknown error occured, please try again later', ephemeral: true}).catch(console.error);
    }
  }
}