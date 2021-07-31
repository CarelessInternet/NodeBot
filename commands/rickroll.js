module.exports = {
  name: 'rickroll',
  description: 'commits rick roll. joins vc if the message author is in one and plays rick roll',
  async execute(msg) {
    await msg.channel.send('https://www.youtube.com/watch?v=dQw4w9WgXcQ').catch(console.error);
  }
};