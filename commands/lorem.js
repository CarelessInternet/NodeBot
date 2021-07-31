const loremIpsum = require('lorem-ipsum').LoremIpsum;

module.exports = {
  name: 'lorem',
  description: 'Gives some lorem ipsum text',
  async execute(msg, args) {
    await msg.channel.send(new loremIpsum({
      sentencesPerParagraph: {
        min: 4,
        max: 10
      },
      wordsPerSentence: {
        min: 10,
        max: 20
      }
    }).generateParagraphs(Math.floor(Math.random() * 2) + 1));
  }
};