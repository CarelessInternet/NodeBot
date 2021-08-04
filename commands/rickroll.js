module.exports = {
  name: 'rickroll',
  execute(interaction) {
    interaction.reply({content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}).catch(console.error);
  }
}