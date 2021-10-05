const {Commands, Guild, check} = require('../../economyClasses');
const shuffle = require('shuffle-array');
const {readFileSync} = require('fs');
const {MessageActionRow, MessageButton, MessageEmbed} = require('discord.js');

class Blackjack {
  static #blackjackCreateGame() {
    return new Promise(async (resolve, reject) => {
      try {
        // i copied the deck of cards json into a file called blackjack.json to prevent errors when fetching
        // because sometimes a 500 error occurs when getting a response from the website.
        // i also did this to improve performance
        // credits to deckofcardsapi.com for the json
        const json = JSON.parse(readFileSync('./economy/blackjack.json', 'utf8'));
        const deck = shuffle(json);

        resolve(deck);
      } catch(err) {
        reject(err);
      }
    });
  }

  static #blackjackDrawCard(deck, count = 1) {
    return new Promise(async (resolve, reject) => {
      try {
        if (count > 1) {
          const cards = [];
          for (let i = 0; i < count; i++) {
            cards.push(deck.shift());
          }
          return resolve(cards);
        }
        
        resolve(deck.shift());
      } catch(err) {
        reject(err);
      }
    });
  }

  static #blackjackCardValue(card) {
    if (card === 'JACK' || card === 'QUEEN' || card === 'KING') return 10;
    else if (card === 'ACE') return 11;
    else return parseInt(card);
  }

  static #blackjackHandValue(hand) {
    let score = hand.reduce((acc, curr) => acc + this.#blackjackCardValue(curr['value']), 0);
    let aces = hand.filter(card => card['value'] === 'ACE').length;

    while (aces > 0) {
      if (score > 21) {
        score -= 10;
        aces--;
      } else {
        break;
      }
    }

    if (score < 21) return [score.toString(), score];
    else if (score === 21) return ['Blackjack!', score];
    else return ['Bust!', score];
  }

  static async #blackjackDealersTurn(i, embed, row, user, interaction, cards, deck) {
    try {
      row.components.forEach(button => button.disabled = true);
      const amount = interaction.options.get('amount')?.value;
      const {player, dealer} = cards;
      const {fields} = embed;

      const [playerStrScore, playerIntScore] = this.#blackjackHandValue(player);
      const arrayOf10 = ['JACK', 'QUEEN', 'KING', '10'];
      const hasBeginningAce = c => c[0]['value'] === 'ACE' || c[1]['value'] === 'ACE';
      const checkFor10 = c => arrayOf10.includes(c[0]['value']) || arrayOf10.includes(c[1]['value']);
      const has10CardAnd21Score = (cards, score) => checkFor10(cards) && score === 21;
      const playerHasBeginningAce = hasBeginningAce(player);

      if (playerIntScore > 21) {
        await Guild.updateCash(user['ID'], user['Cash'] - amount);
        embed.description = `<:haha:875143747640365107> You lost the game and $${amount.toLocaleString()}`;
      } else {        
        while (this.#blackjackHandValue(dealer)[1] < 17) {
          dealer.push(await this.#blackjackDrawCard(deck));
          fields[1].value += `\n${dealer.at(-1)['value']} of ${Commands.capitalize(dealer.at(-1)['suit'])}`;
        }

        const [dealerStrScore, dealerIntScore] = this.#blackjackHandValue(dealer);
        const dealerHasBeginningAce = hasBeginningAce(dealer);
        fields[4].value = dealerHasBeginningAce && has10CardAnd21Score(dealer, dealerIntScore) ? dealerStrScore : (dealerIntScore > 21 ? dealerStrScore : dealerIntScore.toString());

        if (dealerIntScore > 21 || playerIntScore > dealerIntScore) {
          await Guild.updateCash(user['ID'], user['Cash'] + amount);
          embed.description = `🥳 You won against the dealer and got $${amount.toLocaleString()}!`;

        } else if (playerIntScore === dealerIntScore) {
          if (playerHasBeginningAce && !dealerHasBeginningAce && has10CardAnd21Score(player, playerIntScore)) {
            await Guild.updateCash(user['ID'], user['Cash'] + amount);
            embed.description = `😌 You have a blackjack, and the dealer doesn't, you win $${amount.toLocaleString()}!`;

          } else if (dealerHasBeginningAce && !playerHasBeginningAce && has10CardAnd21Score(dealer, dealerIntScore)) {
            await Guild.updateCash(user['ID'], user['Cash'] - amount);
            embed.description = `😔 The dealer has a blackjack, and you don't, you lose $${amount.toLocaleString()}`;

          } else {
            embed.description = '🧐 It\'s a draw! No one wins';
          }
        } else if (playerIntScore < dealerIntScore) {
          await Guild.updateCash(user['ID'], user['Cash'] - amount);
          embed.description = `<:haha:875143747640365107> You lost the game and $${amount.toLocaleString()}`;
        }
      }

      fields[3].value = playerHasBeginningAce && has10CardAnd21Score(player, playerIntScore) ? playerStrScore : (playerIntScore > 21 ? playerStrScore : playerIntScore.toString());
      i.update({embeds: [embed], components: [row]});
    } catch(err) {
      console.error(err);
      i.update({content: 'An unknown error occured whilst playing blackjack, please try again', components: []});
    }
  }

  static async blackjack(user, interaction) {
    // blackjack wouldnt have been possible without this tutorial: https://brilliant.org/wiki/programming-blackjack/
    // for any poor souls who are trying to understand the blackjack code, i am sorry
    try {
      const validate = await Commands.validateCash(interaction, user);
      if (validate) return interaction.reply(validate);
      
      interaction.deferReply();
      const amount = interaction.options.get('amount')?.value;
      const deck = await this.#blackjackCreateGame();
      const cards = {
        player: [],
        dealer: []
      };
      const buttons = [{
        id: 'Hit',
        value: 'Hit',
        color: 'PRIMARY'
      }, {
        id: 'Stand',
        value: 'Stand',
        color: 'SUCCESS'
      }];
      const embed = new MessageEmbed()
      .setColor('RANDOM')
      .setAuthor(interaction.user.tag, interaction.user.displayAvatarURL())
      .setTitle('Blackjack')
      .setDescription(`Betting for $${amount.toLocaleString()}`)
      .setTimestamp();
      const row = new MessageActionRow();

      for (let i = 0; i < buttons.length; i++) {
        row.addComponents(
          new MessageButton()
          .setCustomId(buttons[i]['id'])
          .setLabel(buttons[i]['value'])
          .setStyle(buttons[i]['color'])
        );
      }
      
      cards['player'] = await this.#blackjackDrawCard(deck, 2);
      cards['dealer'].push(await this.#blackjackDrawCard(deck));
      embed.addFields({
        name: 'Your Hand',
        value: `${cards['player'][0]['value']} of ${Commands.capitalize(cards['player'][0]['suit'])}\n${cards['player'][1]['value']} of ${Commands.capitalize(cards['player'][1]['suit'])}`,
        inline: true
      }, {
        name: 'Dealer\'s Hand',
        value: `${cards['dealer'][0]['value']} of ${Commands.capitalize(cards['dealer'][0]['suit'])}`,
        inline: true
      }, {
        name: '\u200B',
        value: '\u200B'
      }, {
        name: 'Your Value',
        value: this.#blackjackHandValue(cards['player'])[0],
        inline: true
      }, {
        name: 'Dealer\'s Value',
        value: this.#blackjackHandValue(cards['dealer'])[0],
        inline: true
      })
      
      const filter = i => buttons.filter(e => e.id === i.customId).length > 0 && i.member.user.id === interaction.user.id;
      const msg = await interaction.followUp({embeds: [embed], components: [row], fetchReply: true});
      const collector = msg.createMessageComponentCollector({filter, time: 2 * 60 * 1000});

      collector.on('collect', async i => {
        if (i.customId === 'Hit') {
          cards['player'].push(await this.#blackjackDrawCard(deck));
          embed.fields[0].value += `\n${cards['player'].at(-1)['value']} of ${Commands.capitalize(cards['player'].at(-1)['suit'])}`;
          embed.fields[3].value = this.#blackjackHandValue(cards['player'])[0];

          if (this.#blackjackHandValue(cards['player'])[1] >= 21) {
            this.#blackjackDealersTurn(i, embed, row, user, interaction, cards, deck);
          } else {
            i.update({embeds: [embed]});
          }
        } else if (i.customId === 'Stand') {
          this.#blackjackDealersTurn(i, embed, row, user, interaction, cards, deck);
        }
      });
      collector.on('end', (collected, reason) => {
        switch (reason) {
          case 'time':
            return;
          case 'messageDelete':
            return;
          case 'channelDelete':
            return;
          case 'guildDelete':
            return;
          case 'limit':
            return;
          default:
            return interaction.channel.send({content: 'Game aborted due to an unknown reason'}).catch(console.error);
        }
      });
    } catch(err) {
      console.error(err);
      interaction.followUp({
        content: 'An unknown error occured whilst creating/playing a blackjack game, please try again later',
        ephemeral: true
      }).catch(console.error);
    }
  }
}

module.exports = {
  data: {
    name: "blackjack",
    description: "Plays a game of classic blackjack, the decks are made possible by deckofcardsapi.com",
    category: "economy",
    cooldown: 5,
    options: [
      {
        name: "amount",
        description: "The amount you want to bet",
        type: 4,
        required: true
      }
    ],
    examples: [
      "blackjack 50",
      "blackjack 1250",
      "blackjack 1337",
      "blackjack 42069"
    ]
  },
  async execute(interaction) {
    try {
      const userGuild = await check(interaction);
      return Blackjack.blackjack(userGuild, interaction);
    } catch(err) {
      console.error(err);
      interaction.reply({content: 'An unknown error occured, please try again later', ephemeral: true}).catch(console.error);
    }
  }
}