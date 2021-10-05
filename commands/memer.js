const Meme = require('memer-api');
const memer = new Meme(process.env.memerToken);
const isURL = require('validator').isURL;
const {MessageAttachment} = require('discord.js');

// text and image gone because idk how to do it with slash commands with the options thing
async function imageSend(format, url, interaction) {
  try {
    const response = await memer[format](url);
    const img = new MessageAttachment(response, 'memer.png');
    interaction.followUp({files: [img]});
  } catch(err) {
    interaction.followUp({
      content: 'An error occured whilst processing the image',
      ephemeral: true
    }).catch(console.error);
  }
}
function image(interaction, format) {
  const url = interaction.options.get('input')?.value;
  const type = url.split('.').pop().toLowerCase();
  if (type !== 'png' && type !== 'jpg' && type !== 'jpeg') return interaction.followUp({content: 'URL must end in .png, .jpg or .jpeg'}).catch(console.error);

  switch (format) {
    case 'affect':
      return imageSend('affect', url, interaction);
    case 'america':
      return imageSend('america', url, interaction);
    case 'brazzers':
      return imageSend('brazzers', url, interaction);
    case 'cancer':
      return imageSend('cancer', url, interaction);
    case 'communism':
      return imageSend('communism', url, interaction);
    case 'delete':
      return imageSend('delete', url, interaction);
    case 'disability':
      return imageSend('disability', url, interaction);
    case 'failure':
      return imageSend('failure', url, interaction);
    case 'fakenews':
      return imageSend('fakenews', url, interaction);
    case 'hitler':
      return imageSend('hitler', url, interaction);
    case 'ipad':
      return imageSend('ipad', url, interaction);
    case 'jail':
      return imageSend('jail', url, interaction);
    case 'roblox':
      return imageSend('roblox', url, interaction);
    case 'satan':
      return imageSend('satan', url, interaction);
    case 'trash':
      return imageSend('trash', url, interaction);
    case 'wanted':
      return imageSend('wanted', url, interaction);
    case 'whodidthis':
      return imageSend('whodidthis', url, interaction);
    default:
      text(interaction, format);
  }
}

async function textImageSend(format, interaction, text) {
  try {
    const response = await memer[format](interaction.user.displayAvatarURL(), interaction.user.username, text);
    const img = new MessageAttachment(response, 'memer.png');
    interaction.followUp({files: [img]});
  } catch(err) {
    interaction.followUp({
      content: 'An error occured whilst processing the image',
      ephemeral: true
    }).catch(console.error);
  }
}
async function textSend(format, interaction, text) {
  try {
    const response = await memer[format](text);
    const img = new MessageAttachment(response, 'memer.png');
    interaction.followUp({files: [img]});
  } catch(err) {
    interaction.followUp({
      content: 'An error occured whilst processing the image',
      ephemeral: true
    }).catch(console.error);
  }
}
function text(interaction, format) {
  const text = interaction.options.get('input')?.value;
  
  switch (format) {
    case 'byemom':
      return textImageSend('byemom', interaction, text);
    case 'tweet':
      return textImageSend('tweet', interaction, text);
    case 'youtube':
      return textImageSend('youtube', interaction, text);
    case 'abandon':
      return textSend('abandon', interaction, text);
    case 'armor':
      return textSend('armor', interaction, text);
    case 'changemymind':
      return textSend('changemymind', interaction, text);
    case 'cry':
      return textSend('cry', interaction, text);
    case 'emergencymeeting':
      return textSend('emergencymeeting', interaction, text);
    case 'excuseme':
      return textSend('execuseme', interaction, text);
    case 'facts':
      return textSend('facts', interaction, text);
    case 'godwhy':
      return textSend('godwhy', interaction, text);
    case 'keepdistance':
      return textSend('keepdistance', interaction, text);
    case 'note':
      return textSend('note', interaction, text);
    case 'shit':
      return textSend('shit', interaction, text);
    case 'walking':
      return textSend('walking', interaction, text);
    default:
      interaction.followUp({
        content: 'Could not find the image manipulation request, is your syntax correct? Maybe you forgot or added text after the image method?',
        ephemeral: true
      }).catch(console.error);
  }
}

module.exports = {
  data: {
    name: "memer",
    description: "Meme image manipulation powered by the memer-api module",
    category: "memes",
    options: [
      {
        name: "format",
        description: "The format/template of the meme",
        type: 3,
        required: true
      },
      {
        name: "input",
        description: "The text to be sent, or the URL",
        type: 3,
        required: true
      }
    ],
    examples: [
      "memer abandon text",
      "memer affect link",
      "memer america link",
      "memer armor text",
      "memer brazzers link",
      "memer byemom text",
      "memer cancer link",
      "memer changemymind text",
      "memer communism link",
      "memer cry text",
      "memer delete link",
      "memer disability link",
      "memer emergencymeeting text",
      "memer excuseme text",
      "memer facts text",
      "memer failure link",
      "memer fakenews link",
      "memer godwhy text",
      "memer hitler link",
      "memer ipad link",
      "memer jail link",
      "memer keepdistance text",
      "memer note text",
      "memer roblox link",
      "memer satan link",
      "memer shit text",
      "memer stroke text",
      "memer trash link",
      "memer tweet text",
      "memer walking text",
      "memer wanted link",
      "memer whodidthis link",
      "memer youtube text"
    ]
  },
  async execute(interaction) {
    await interaction.deferReply().catch(console.error);

    const format = interaction.options.get('format')?.value.toLowerCase();
    const input = interaction.options.get('input')?.value;

    if (isURL(input)) image(interaction, format);
    else text(interaction, format);
  }
}