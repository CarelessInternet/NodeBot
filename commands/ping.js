module.exports = {
  name: 'ping',
  description: 'Gives out pongs back',
  async execute(msg, args) {
    function timer(times = 3) {
      let count = 0,
      time = setInterval(async () => {
        count++;
        await msg.channel.send(`Pong #${count}`);
        if (count >= times)
          await clearInterval(time);
      }, 2000);
    }

    if (args.length) {
      if (!isNaN(args[0]) && Number(args[0]) <= 5 && Number(args[0]) >= 1) {
        await timer(Number(args[0]));
      } else {
        await msg.channel.send('Number must be between 1 and 5, sending 3 pongs');
        await timer();
      }
    } else {
      await timer();
    }
  }
};