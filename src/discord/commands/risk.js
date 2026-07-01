'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { positionSize } = require('../../lib/seatbelt');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('risk')
    .setDescription('Work out a safe position size from the money you will risk.')
    .addNumberOption((o) => o.setName('balance').setDescription('Your account balance').setRequired(true))
    .addNumberOption((o) => o.setName('risk_percent').setDescription('Percent to risk (e.g. 1)').setRequired(true))
    .addNumberOption((o) => o.setName('entry').setDescription('Planned entry price').setRequired(true))
    .addNumberOption((o) => o.setName('stop').setDescription('Planned stop-loss price').setRequired(true))
    .addNumberOption((o) => o.setName('pip_value').setDescription('Value per point per unit (default 10)').setRequired(false)),

  async execute(interaction) {
    const accountBalance = interaction.options.getNumber('balance', true);
    const riskPercent = interaction.options.getNumber('risk_percent', true);
    const entry = interaction.options.getNumber('entry', true);
    const stop = interaction.options.getNumber('stop', true);
    const pipValue = interaction.options.getNumber('pip_value') ?? 10;

    const r = positionSize({ accountBalance, riskPercent, entry, stop, pipValue });

    if (!r.ok) {
      await interaction.reply({ content: `⚠️ Can't calculate: ${r.error}`, ephemeral: true });
      return;
    }

    await interaction.reply({
      content:
        `🧮 **Position size**\n` +
        `• Money at risk: **$${r.riskAmount}** (${riskPercent}% of $${accountBalance})\n` +
        `• Stop distance: **${r.stopDistance}**\n` +
        `• Suggested size: **${r.units} units/lots**\n\n` +
        `${r.note}`,
      ephemeral: true,
    });
  },
};
