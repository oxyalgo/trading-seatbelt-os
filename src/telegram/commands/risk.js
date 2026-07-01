'use strict';

const { positionSize } = require('../../lib/seatbelt');

const USAGE =
  'Send it like this:\n`/risk 10000 1 1.1050 1.1000`\n' +
  '(balance, risk %, entry, stop — optional 5th number is point value)';

/**
 * /risk <balance> <risk%> <entry> <stop> [pipValue] — safe position size.
 * @param {import('grammy').Context} ctx
 */
async function risk(ctx) {
  const parts = (ctx.match || '').trim().split(/\s+/).filter(Boolean).map(Number);
  if (parts.length < 4 || parts.some((n) => !Number.isFinite(n))) {
    await ctx.reply(USAGE, { parse_mode: 'Markdown' });
    return;
  }

  const [accountBalance, riskPercent, entry, stop, pipValue = 10] = parts;
  const r = positionSize({ accountBalance, riskPercent, entry, stop, pipValue });

  if (!r.ok) {
    await ctx.reply(`⚠️ Can't calculate: ${r.error}`);
    return;
  }

  await ctx.reply(
    `🧮 Position size\n` +
      `• Money at risk: $${r.riskAmount} (${riskPercent}% of $${accountBalance})\n` +
      `• Stop distance: ${r.stopDistance}\n` +
      `• Suggested size: ${r.units} units/lots\n\n` +
      `${r.note}`
  );
}

module.exports = { risk };
