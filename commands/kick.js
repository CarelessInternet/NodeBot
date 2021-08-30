const {MessageActionRow, MessageButton} = require('discord.js');

module.exports = {
  data: {
    name: "kick",
    description: "Kicks a user from the server",
    category: "staff",
    options: [
      {
        name: "user",
        description: "The desired user to be kicked",
        type: 6,
        required: true
      },
      {
        name: "reason",
        description: "The reason for the kick",
        type: 3,
        required: false
      }
    ],
    examples: [
      "kick @SomeDude#1337",
      "kick @you#5555 why are you gae",
      "kick @noone#2321",
      "kick @whyamistillherejusttosuffer#1111 reason reason reason reason sample text"
    ]
  },
  async execute(interaction) {
    if (!interaction.inGuild()) return interaction.reply({content: 'You need to be in a guild to use this command'}).catch(console.error);

    const args = [interaction.options.get('user')?.member, interaction.options.get('reason')?.value];
    if (!args[0]) return interaction.reply({content: 'Please specify a user', ephemeral: true}).catch(console.error);
    if (!interaction.guild.me.permissions.has(['KICK_MEMBERS', 'MANAGE_MESSAGES'])) return interaction.reply({content: 'I need the kick members and manage messages permissions to run this command', ephemeral: true}).catch(console.error);
    if (!interaction.member.permissions.has('KICK_MEMBERS')) return interaction.reply({content: 'You do not have the right permissions to kick a member', ephemeral: true}).catch(console.error);

    const filter = i => (i.customId === 'Confirm' || i.customId === 'Abort') && i.member.user.id === interaction.member.id;
    const reason = args[1] ?? '';
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
    const confirmation = await interaction.reply({
      content: `Are you sure you want to kick <@${args[0].user.id}>${reason ? ' for the following reason: ' + reason : ''}?`,
      components: [row],
      fetchReply: true
    }).catch(console.error);
    const collector = confirmation.createMessageComponentCollector({filter, max: 1, time: 7 * 1000});

    collector.on('collect', i => {
      const reaction = i.customId;
      if (reaction === 'Confirm') {
        if (args[0].user.id === interaction.member.id) return i.update({content: 'You cannot kick yourself', components: []}).catch(console.error);
        if (args[0].permissions.has('KICK_MEMBERS')) return i.update({content: 'Failed to kick because the user has kick members permission', components: []}).catch(console.error);

        args[0].kick(reason)
        .then(user => i.update({content: `👍 ${user.id ? '<@' + user.id + '>' : user.user.username} has been kicked from ${interaction.guild.name}`, components: []}).catch(console.error))
        .catch(err => i.update({content: '👎 Failed to kick, usually because the user has some form of mod/admin on this server, or my highest role is listed lower than the requested user\'s roles', components: []}).catch(console.error));
      } else if (reaction === 'Abort') {
        i.update({content: 'Kick has been aborted', components: []}).catch(console.error);
      }
    });
    collector.on('end', (collected, reason) => {
      switch (reason) {
        case 'time':
          return confirmation.edit({content: 'Kick aborted due to no response', components: []}).catch(console.error);
        case 'messageDelete':
          return interaction.channel.send({content: 'Kick aborted because the message was deleted'}).catch(console.error);
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
  }
}