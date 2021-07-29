const Meme = require('memer-api');
const memer = new Meme(process.env.memerToken);
const isURL = require('validator').isURL;

// i have no idea what all the code is, im practically just copying from my old code made in discord.js v12
function textAndImage(msg, arguments, Discord) {
  const args = arguments.slice();
  const attachment = msg.attachments.array()?.[0] ?? args[1];
  const url = typeof attachment === 'object' && attachment !== null ? attachment.url : args[1];
  const type = url.split('.').pop().toLowerCase();
  const arg = args.shift().toLowerCase();
  if (!attachment.hasOwnProperty('name')) args.shift();

  if (type !== 'png' && type !== 'jpg' && type !== 'jpeg') return msg.reply('File/URL must end in .png, .jpg, or .jpeg').catch(console.error);
  switch (arg) {
    case 'floor': {
      return memer.floor(args.join(' '), url).then(img => {
        msg.reply({files: [new Discord.MessageAttachment(img, 'memer.png')]}).catch(console.error);
      })
      .catch(err => msg.reply('An error occured whilst processing the image').catch(console.error));
    }
    case 'obama': {
      return memer.obama(args.join(' '), url).then(img => {
        msg.reply({files: [new Discord.MessageAttachment(img, 'memer.png')]}).catch(console.error);
      })
      .catch(err => msg.reply('An error occured whilst processing the image').catch(console.error));
    }
    default: {
      image(msg, arguments, Discord);
    }
  }
}

function imageSend(format, msg, Discord, url) {
  memer[format](url).then(img => {
    msg.reply({files: [new Discord.MessageAttachment(img, 'memer.png')]}).catch(console.error);
  })
  .catch(err => msg.reply('An error occured whilst processing the image').catch(console.error));
}
function image(msg, arguments, Discord) {
  const args = arguments.slice();
  const attachment = msg.attachments.array()?.[0] ?? args[1];
  const url = typeof attachment === 'object' && attachment !== null ? attachment.url : args[1];
  const type = url.split('.').pop().toLowerCase();

  if (type !== 'png' && type !== 'jpg' && type !== 'jpeg') return msg.reply('File/URL must end in .png, .jpg, or .jpeg').catch(console.error);
  switch (args[0].toLowerCase()) {
    case 'affect':
      return imageSend('affect', msg, Discord, url);
    case 'america':
      return imageSend('america', msg, Discord, url);
    case 'brazzers':
      return imageSend('brazzers', msg, Discord, url);
    case 'cancer':
      return imageSend('cancer', msg, Discord, url);
    case 'communism':
      return imageSend('communism', msg, Discord, url);
    case 'delete':
      return imageSend('delete', msg, Discord, url);
    case 'disability':
      return imageSend('disability', msg, Discord, url);
    case 'failure':
      return imageSend('failure', msg, Discord, url);
    case 'fakenews':
      return imageSend('fakenews', msg, Discord, url);
    case 'hitler':
      return imageSend('hitler', msg, Discord, url);
    case 'ipad':
      return imageSend('ipad', msg, Discord, url);
    case 'jail':
      return imageSend('jail', msg, Discord, url);
    case 'roblox':
      return imageSend('roblox', msg, Discord, url);
    case 'satan':
      return imageSend('satan', msg, Discord, url);
    case 'trash':
      return imageSend('trash', msg, Discord, url);
    case 'wanted':
      return imageSend('wanted', msg, Discord, url);
    case 'whodidthis':
      return imageSend('whodidthis', msg, Discord, url);
    default:
      text(msg, arguments, Discord);
  }
}

function textImageSend(format, msg, Discord, url, username, text) {
  memer[format](url, username, text).then(img => {
    msg.reply({files: [new Discord.MessageAttachment(img, 'memer.png')]}).catch(console.error);
  })
  .catch(err => msg.reply('An error occured whilst processing the image wr').catch(console.error));
}
function textSend(format, msg, Discord, text) {
  memer[format](text).then(img => {
    msg.reply({files: [new Discord.MessageAttachment(img, 'memer.png')]}).catch(console.error);
  })
  .catch(err => msg.reply('An error occured whilst processing the image').catch(console.error));
}
function text(msg, arguments, Discord) {
  if (arguments.length < 2) return msg.reply('Missing the second parameter, or your command\'s syntax is wrong').catch(console.error);
  const arg = arguments.shift().toLowerCase();
  const text = arguments.join(' ');

  switch (arg) {
    case 'byemom':
      return textImageSend('byemom', msg, Discord, msg.author.avatarURL(), msg.author.username, text);
    case 'tweet':
      return textImageSend('tweet', msg, Discord, msg.author.avatarURL(), msg.author.username, text);
    case 'youtube':
      return textImageSend('youtube', msg, Discord, msg.author.avatarURL(), msg.author.username, text);
    case 'abandon':
      return textSend('abandon', msg, Discord, text);
    case 'armor':
      return textSend('armor', msg, Discord, text);
    case 'changemymind':
      return textSend('changemymind', msg, Discord, text);
    case 'cry':
      return textSend('cry', msg, Discord, text);
    case 'emergencymeeting':
      return textSend('emergencymeeting', msg, Discord, text);
    case 'excuseme':
      return textSend('execuseme', msg, Discord, text);
    case 'facts':
      return textSend('facts', msg, Discord, text);
    case 'godwhy':
      return textSend('godwhy', msg, Discord, text);
    case 'keepdistance':
      return textSend('keepdistance', msg, Discord, text);
    case 'note':
      return textSend('note', msg, Discord, text);
    case 'shit':
      return textSend('shit', msg, Discord, text);
    case 'walking':
      return textSend('walking', msg, Discord, text);
    default:
      msg.reply('Could not find the image manipulation request, is your syntax correct? Maybe you forgot or added text after the image method?').catch(console.error);
  }
}

module.exports = {
  name: 'memer',
  description: 'Meme image manipulation powered by the memer-api module. The second parameter may be required depending on the type of image method',
  execute(msg, args, Discord) {
    if (!args[0]) return msg.reply('Specify what type of image manipulation you want').catch(console.error);
    if (!args[1] && msg.attachments.size === 0) return msg.reply('Missing the image/text').catch(console.error);

    if (msg.attachments.size > 0 || isURL(args[1])) {
      if ((args.length > 1 && msg.attachments.size > 0) || (args.length > 2 && isURL(args[1]))) {
        textAndImage(msg, args, Discord);
      } else {
        image(msg, args, Discord);
      }
    } else {
      text(msg, args, Discord);
    }
  }
}; 