'use strict';

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('start')
    .setDescription('New here? Learn what the Trading Seatbelt does.'),

  async execute(interaction) {
    await interaction.reply({
      content:
        `👋 **Welcome. This bot is your trading seatbelt.**\n\n` +
        `Most beginners don't blow up from bad entries. They blow up from scams, ` +
        `over-sized bets, and revenge trading. This bot helps you avoid all three.\n\n` +
        `**Try these:**\n` +
        `• \`/scamcheck\` — paste any offer and get a scam risk score\n` +
        `• \`/risk\` — get a safe position size before you enter\n` +
        `• \`/check\` — run the pre-trade seatbelt checklist\n` +
        `• \`/review\` — reflect after a trade so you learn from it\n\n` +
        `**Golden rule:** risk 1% or less per trade, always set a stop, and never chase losses.\n\n` +
        `_Education and risk tools only. Not financial advice. Trading has real risk of loss._`,
      ephemeral: true,
    });
  },
};
