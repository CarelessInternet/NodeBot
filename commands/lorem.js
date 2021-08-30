const {LoremIpsum} = require('lorem-ipsum');

module.exports = {
  data: {
    name: "lorem",
    description: "Spits out some lorem ipsum text",
    category: "other",
    options: [],
    examples: [
      "lorem"
    ]
  },
  execute(interaction) {
    const random = Math.floor(Math.random() * 2) + 1;
    const text = new LoremIpsum({
      sentencesPerParagraph: {
        min: 4,
        max: 10
      },
      wordsPerSentence: {
        min: 10,
        max: 20
      }
    }).generateParagraphs(random);

    interaction.reply({content: text}).catch(console.error);
  }
}