'use strict';

const { checkOffer } = require('../../lib/seatbelt');

const EMOJI = { 'HIGH RISK': '🚨', CAUTION: '⚠️', 'LOWER RISK': '✅' };

/**
 * /scamcheck <text> — score a pasted offer for scam red flags.
 * @param {import('grammy').Context} ctx
 */
async function scamcheck(ctx) {
  const text = (ctx.match || '').trim();
  if (!text) {
    await ctx.reply('Send it like this:\n`/scamcheck Guaranteed profits, DM me now`', {
      parse_mode: 'Markdown',
    });
    return;
  }

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

  await ctx.reply(
    `${EMOJI[level]} ${level} — score ${score}/10\n\nWhy:\n${flagList}\n\nWhat to do: ${advice}`
  );
}

module.exports = { scamcheck };
