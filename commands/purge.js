module.exports = {
  data: {
    name: "purge",
    description: "Removes the latest messages by the requested amount",
    category: "staff",
    options: [
      {
        name: "amount",
        description: "The amount of messages to delete",
        type: 4,
        required: true
      }
    ],
    examples: [
      "purge 5",
      "purge 15",
      "purge 30",
      "purge 100"
    ]
  },
  async execute(interaction) {
    if (!interaction.inGuild()) return interaction.reply({content: 'You need to be in server to use this command'}).catch(console.error);
    if (!interaction.member.permissions.has('MANAGE_MESSAGES')) return interaction.reply({content: 'You need the manage messages permission to run this command', ephemeral: true}).catch(console.error);
    if (!interaction.guild.me.permissions.has('MANAGE_MESSAGES')) return interaction.reply({content: 'I need the manage messages permission to run this command'}).catch(console.error);

    try {
      const amount = interaction.options.get('amount')?.value;
      if (amount < 1 || amount > 100) return interaction.reply({content: 'Amount must be at minimum 1 and at maximum 100', ephemeral: true});

      const deleted = await interaction.channel.bulkDelete(amount);
      interaction.reply({content: `👍 Successfully deleted the last ${deleted.size} ${deleted.size == 1 ? 'message' : 'messages'}`});
    } catch(err) {
      interaction.reply({
        content: 'An error occured whilst trying to purge messages, please try again later',
        ephemeral: true
      }).catch(console.error);
    }
  }
}