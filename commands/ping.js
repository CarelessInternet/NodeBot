function send(msg, times = 1) {
  let count = 0;
  const timer = setInterval(() => {
    count++;
    msg.channel.send(`Pong #${count}`).catch(console.error);
    if (count >= times) clearInterval(timer);
  }, 2000);
}

function isBetween(arg, min, max) {
  return parseInt(arg) >= min && parseInt(arg) <= max;
}

module.exports = {
  name: 'ping',
  description: 'Sends pongs back',
  execute(msg, args) {
    if (!args[0]) return send(msg);
    if (isNaN(args[0])) return send(msg);

    if (isBetween(args[0], 1, 5)) return send(msg, Number(args[0]));
    msg.reply('Must be between 1 and 5, sending one pong').catch(console.error);
    send(msg);
  }
}