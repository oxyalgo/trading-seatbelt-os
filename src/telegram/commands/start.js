'use strict';

/**
 * /start — beginner onboarding.
 * @param {import('grammy').Context} ctx
 */
async function start(ctx) {
  await ctx.reply(
    `👋 Welcome. This bot is your trading seatbelt.\n\n` +
      `Most beginners don't blow up from bad entries. They blow up from scams, ` +
      `over-sized bets, and revenge trading. This bot helps you avoid all three.\n\n` +
      `Try these:\n` +
      `• /scamcheck <text> — score any offer for scam red flags\n` +
      `• /risk <balance> <risk%> <entry> <stop> — safe position size\n\n` +
      `Golden rule: risk 1% or less per trade, always set a stop, and never chase losses.\n\n` +
      `Education and risk tools only. Not financial advice. Trading has real risk of loss.`
  );
}

module.exports = { start };
