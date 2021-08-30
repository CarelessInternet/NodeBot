module.exports = {
  data: {
    name: "rickroll",
    description: "commits rick roll. joins vc if the message author is in one and plays rick roll",
    category: "memes",
    options: [],
    examples: [
      "rickroll"
    ]
  },
  execute(interaction) {
    interaction.reply({content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}).catch(console.error);
  }
}