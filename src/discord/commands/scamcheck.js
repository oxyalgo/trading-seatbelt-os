'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { checkOffer } = require('../../lib/seatbelt');

const EMOJI = { 'HIGH RISK': '🚨', CAUTION: '⚠️', 'LOWER RISK': '✅' };

module.exports = {
  data: new SlashCommandBuilder()
    .setName('scamcheck')
    .setDescription('Paste a message or offer and get a scam risk score.')
    .addStringOption((opt) =>
      opt.setName('text').setDescription('The DM, ad, or pitch to check').setRequired(true)
    ),

  async execute(interaction) {
    const text = interaction.options.getString('text', true);
    const { hits, score, level } = checkOffer(text);

    const flagList = hits.length
      ? hits.map((h) => `• ${h.label}`).join('\n')
      : 'No common scam patterns found. Still, stay careful.';

    const advice =
      level === 'HIGH RISK'
        ? 'Do not send money or account access. This looks like a scam.'
        : level === 'CAUTION'
          ? 'Slow down. Ask for proof and never pay under pressure.'
          : 'Looks lower risk, but no one can guarantee profits. Trust your gut.';

    await interaction.reply({
      content: `${EMOJI[level]} **${level}** — score ${score}/10\n\n**Why:**\n${flagList}\n\n**What to do:** ${advice}`,
      ephemeral: true,
    });
  },
};
