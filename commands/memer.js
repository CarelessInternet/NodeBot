const Meme = require('memer-api'),
memer = new Meme(process.env.memerToken),
isURL = require('validator').isURL;

module.exports = {
  name: 'memer',
  description: 'Meme image manipulation powered by the memer-api module. The second parameter may be required depending on the type of image method',
  execute(msg, args, Discord) {
    if (!args[0]) return msg.reply('Specify what type of image manipulation you want');
    if (msg.attachments.size > 0 || isURL(args[1])) {
      if ((args.length > 1 && msg.attachments.size > 0) || (args.length > 2 && isURL(args[1]))) {
        one(msg, args, Discord);
      } else {
        two(msg, args, Discord);
      }
    } else {
      three(msg, args, Discord);
    }
  }
}
function one(msg, args2, Discord) {
  const args = args2.slice(),
  attachment = msg.attachments.size > 0 ? msg.attachments.array()[0] : args[1],
  url = typeof attachment === 'object' && attachment !== null ? attachment.url : args[1],
  type = url.split('.').pop().toLowerCase(),
  arg = args.shift().toLowerCase();
  if (!attachment.hasOwnProperty('name')) args.shift();

  if (type == 'png' || type == 'jpg' || type == 'jpeg') {
    switch (arg) {
      case 'floor':
        return memer.floor(args.join(' '), url).then(img => msg.channel.send(new Discord.MessageAttachment(img, 'memer.png')));
      case 'obama':
        return memer.obama(args.join(' '), url).then(img => msg.channel.send(new Discord.MessageAttachment(img, 'memer.png')));
      default:
        return two(msg, args2, Discord);
    }
  } else {
    msg.reply('File must be a .png, .jpg, or .jpeg image');
  }
}
function two(msg, args2, Discord) {
  const args = args2.slice(),
  attachment = msg.attachments.size > 0 ? msg.attachments.array()[0] : args[1],
  url = typeof attachment === 'object' && attachment !== null ? attachment.url : args[1];
  const type = url.split('.').pop().toLowerCase();
  
  if (type == 'png' || type == 'jpg' || type == 'jpeg') {
    switch (args[0].toLowerCase()) {
      case 'affect':
        return memer.affect(url).then(img => msg.channel.send(new Discord.MessageAttachment(img, 'memer.png')));
      case 'america':
        return memer.america(url).then(img => msg.channel.send(new Discord.MessageAttachment(img, 'memer.png')));
      case 'brazzers':
        return memer.brazzers(url).then(img => msg.channel.send(new Discord.MessageAttachment(img, 'memer.png')));
      case 'cancer':
        return memer.cancer(url).then(img => msg.channel.send(new Discord.MessageAttachment(img, 'memer.png')));
      case 'communism':
        return memer.communism(url).then(img => msg.channel.send(new Discord.MessageAttachment(img, 'memer.png')));
      case 'delete':
        return memer.delete(url).then(img => msg.channel.send(new Discord.MessageAttachment(img, 'memer.png')));
      case 'disability':
        return memer.disability(url).then(img => msg.channel.send(new Discord.MessageAttachment(img, 'memer.png')));
      case 'failure':
        return memer.failure(url).then(img => msg.channel.send(new Discord.MessageAttachment(img, 'memer.png')));
      case 'fakenews':
        return memer.fakenews(url).then(img => msg.channel.send(new Discord.MessageAttachment(img, 'memer.png')));
      case 'hitler':
        return memer.hitler(url).then(img => msg.channel.send(new Discord.MessageAttachment(img, 'memer.png')));
      case 'ipad':
        return memer.ipad(url).then(img => msg.channel.send(new Discord.MessageAttachment(img, 'memer.png')));
      case 'jail':
        return memer.jail(url).then(img => msg.channel.send(new Discord.MessageAttachment(img, 'memer.png')));
      case 'roblox':
        return memer.roblox(url).then(img => msg.channel.send(new Discord.MessageAttachment(img, 'memer.png')));
      case 'satan':
        return memer.satan(url).then(img => msg.channel.send(new Discord.MessageAttachment(img, 'memer.png')));
      case 'trash':
        return memer.trash(url).then(img => msg.channel.send(new Discord.MessageAttachment(img, 'memer.png')));
      case 'wanted':
        return memer.wanted(url).then(img => msg.channel.send(new Discord.MessageAttachment(img, 'memer.png')));
      case 'whodidthis':
        return memer.whodidthis(url).then(img => msg.channel.send(new Discord.MessageAttachment(img, 'memer.png')));
      default:
        return three(msg, args2, Discord);
    }
  } else {
    msg.reply('File must be a .png, .jpg, or .jpeg image');
  }
}
function three(msg, args, Discord) {
  if (args.length > 1) {
    const arg = args.shift().toLowerCase();
    switch (arg) {
      case 'byemom':
        return memer.byemom(msg.author.avatarURL(), msg.author.username, args.join(' ')).then(img => msg.channel.send(new Discord.MessageAttachment(img, 'memer.png')));
      case 'tweet':
        return memer.tweet(msg.author.avatarURL(), msg.author.username, args.join(' ')).then(img => msg.channel.send(new Discord.MessageAttachment(img, 'memer.png')));
      case 'youtube':
        return memer.youtube(msg.author.avatarURL(), msg.author.username, args.join(' ')).then(img => msg.channel.send(new Discord.MessageAttachment(img, 'memer.png')));
      case 'abandon':
        return memer.abandon(args.join(' ')).then(img => msg.channel.send(new Discord.MessageAttachment(img, 'memer.png')));
      case 'armor':
        return memer.armor(args.join(' ')).then(img => msg.channel.send(new Discord.MessageAttachment(img, 'memer.png')));
      case 'changemymind':
        return memer.changemymind(args.join(' ')).then(img => msg.channel.send(new Discord.MessageAttachment(img, 'memer.png')));
      case 'cry':
        return memer.cry(args.join(' ')).then(img => msg.channel.send(new Discord.MessageAttachment(img, 'memer.png')));
      case 'emergencymeeting':
        return memer.emergencymeeting(args.join(' ')).then(img => msg.channel.send(new Discord.MessageAttachment(img, 'memer.png')));
      case 'excuseme':
        return memer.excuseme(args.join(' ')).then(img => msg.channel.send(new Discord.MessageAttachment(img, 'memer.png')));
      case 'facts':
        return memer.facts(args.join(' ')).then(img => msg.channel.send(new Discord.MessageAttachment(img, 'memer.png')));
      case 'godwhy':
        return memer.godwhy(args.join(' ')).then(img => msg.channel.send(new Discord.MessageAttachment(img, 'memer.png')));
      case 'keepdistance':
        return memer.keepdistance(args.join(' ')).then(img => msg.channel.send(new Discord.MessageAttachment(img, 'memer.png')));
      case 'note':
        return memer.note(args.join(' ')).then(img => msg.channel.send(new Discord.MessageAttachment(img, 'memer.png')));
      case 'shit':
        return memer.shit(args.join(' ')).then(img => msg.channel.send(new Discord.MessageAttachment(img, 'memer.png')));
      case 'stroke':
        return memer.stroke(args.join(' ')).then(img => msg.channel.send(new Discord.MessageAttachment(img, 'memer.png')));
      case 'walking':
        return memer.walking(args.join(' ')).then(img => msg.channel.send(new Discord.MessageAttachment(img, 'memer.png')));
      default:
        return msg.reply('Could not find the image manipulation request, are you maybe missing or adding text after the image method? Is your syntax correct, or perhaps an error occured');
    }
  } else {
    msg.reply('Missing the second parameter, or your command\'s syntax is wrong');
  }
}