const loremIpsum = require('lorem-ipsum').LoremIpsum;

module.exports = {
  name: 'lorem',
  description: 'Gives some lorem ipsum text',
  execute(msg) {
    const random = Math.floor(Math.random() * 2) + 1;
    const text = new loremIpsum({sentencesPerParagraph: {min: 4, max: 10}, wordsPerSentence: {min: 10, max: 20}}).generateParagraphs(random);

    msg.channel.send(text).catch(console.error);
  }
};