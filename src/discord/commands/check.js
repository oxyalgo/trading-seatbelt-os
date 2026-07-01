'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { checklist } = require('../../lib/seatbelt');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('check')
    .setDescription('Run the pre-trade seatbelt checklist before you enter.'),

  async execute(interaction) {
    const items = checklist()
      .map((q, i) => `${i + 1}. ${q}`)
      .join('\n');

    await interaction.reply({
      content:
        `🦺 **Pre-trade checklist**\nTick each one before you click buy or sell:\n\n${items}\n\n` +
        `If you answer "no" to any of these, don't take the trade yet.`,
      ephemeral: true,
    });
  },
};
