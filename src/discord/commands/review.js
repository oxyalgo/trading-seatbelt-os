'use strict';

const { SlashCommandBuilder } = require('discord.js');
const { revengeGuard } = require('../../lib/seatbelt');

const PROMPTS = [
  'Did you follow your plan, or did you improvise?',
  'Was your stop-loss set before you entered?',
  'What did you feel right before you clicked? (calm, greedy, scared, bored?)',
  'If this trade lost, was it a bad trade or just a bad outcome?',
  'What is one thing you would do the same next time?',
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('review')
    .setDescription('Reflect after a trade so you actually learn from it.')
    .addIntegerOption((o) =>
      o
        .setName('recent_losses')
        .setDescription('Losing trades in a row right now (for the cooldown check)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const recentLosses = interaction.options.getInteger('recent_losses') ?? 0;
    const guard = revengeGuard(recentLosses);

    const cooldownLine = guard.cooldown
      ? `\n\n⛔ **Cooldown:** ${guard.message}`
      : `\n\n✅ ${guard.message}`;

    const questions = PROMPTS.map((q, i) => `${i + 1}. ${q}`).join('\n');

    await interaction.reply({
      content: `📝 **Post-trade review**\nAnswer these honestly:\n\n${questions}${cooldownLine}`,
      ephemeral: true,
    });
  },
};
