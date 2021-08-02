async function interaction(client, Discord, interaction) {
  if (!interaction.isCommand()) return;

  try {
    await client.commands.get(interaction.commandName).execute(interaction);
  } catch(err) {
    console.error(err);
    await interaction.reply({content: 'error occured'}).catch(console.error);
  }
}

module.exports = interaction;