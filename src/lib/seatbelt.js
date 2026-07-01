'use strict';

/**
 * Trading Seatbelt — core safety logic.
 *
 * Every function here is pure (no I/O, no network, no secrets). The Discord and
 * Telegram bots both call into this file so the two front-ends behave the same.
 *
 * Nothing in here places trades or reads live market data. This is the seatbelt,
 * not the engine.
 */

// -----------------------------------------------------------------------------
// Scam / red-flag checker
// -----------------------------------------------------------------------------

/**
 * Patterns that show up again and again in trading scams and bad "gurus".
 * Each entry has a regex and a plain-English label a beginner can understand.
 */
const RED_FLAGS = [
  { pattern: /\b(guaranteed|guarantee|risk[-\s]?free|can't lose|cannot lose|no loss|zero loss)\b/i, label: 'Guarantees profits or says there is no risk' },
  { pattern: /\b(pass(ed)?|fund(ed)?|payout)\b.*\b(prop|challenge|evaluation|eval)\b|\b(prop|challenge|evaluation|eval)\b.*\b(pass(ed)?|guarantee|guaranteed)\b/i, label: 'Promises prop-firm passes or payouts' },
  { pattern: /\b(\d{2,4}%|double your|triple your|10x|100x|flip)\b/i, label: 'Uses extreme return claims' },
  { pattern: /\b(send|deposit|wire|cashapp|zelle|crypto|usdt|btc|eth)\b.*\b(me|wallet|address|now|today)\b/i, label: 'Pushes direct payment or crypto wallet transfers' },
  { pattern: /\b(account management|manage your account|login|password|credentials|teamviewer|anydesk)\b/i, label: 'Asks for account access or remote-control access' },
  { pattern: /\b(limited spots|last chance|today only|act now|urgent|dm now|private link)\b/i, label: 'Uses pressure or urgency' },
  { pattern: /\b(vip signal|premium signal|copy my trades|signals group|secret strategy|insider)\b/i, label: 'Sells hidden signals without transparent risk rules' },
  { pattern: /\b(recover your loss|loss recovery|revenge|martingale|double lot|double down)\b/i, label: 'Encourages revenge trading or doubling down' },
  { pattern: /\b(screenshot|profit proof|withdrawal proof|lifestyle|lamborghini|rolex)\b/i, label: 'Leans on screenshots or lifestyle proof instead of audited results' },
];

/**
 * Scan a block of text (a DM, an ad, a pitch) for scam red flags.
 *
 * @param {string} text - the message to check
 * @returns {{ hits: Array<{pattern: RegExp, label: string}>, score: number, level: string }}
 */
function checkOffer(text) {
  const hits = RED_FLAGS.filter((flag) => flag.pattern.test(text));
  const score = Math.min(10, hits.length + (hits.length >= 3 ? 2 : 0));
  return { hits, score, level: score >= 6 ? 'HIGH RISK' : score >= 3 ? 'CAUTION' : 'LOWER RISK' };
}

// -----------------------------------------------------------------------------
// Position-size risk calculator
// -----------------------------------------------------------------------------

/**
 * Work out a safe position size from the money you are willing to lose.
 *
 * This is the "never risk more than you planned" rule turned into math. You tell
 * it your balance, how much of it you'll risk on this one trade, your entry, and
 * your stop. It tells you the dollar risk, the distance to your stop, and how
 * many lots/units that maps to.
 *
 * @param {object} args
 * @param {number} args.accountBalance - total account balance
 * @param {number} args.riskPercent    - percent of balance to risk (e.g. 1 for 1%)
 * @param {number} args.entry          - planned entry price
 * @param {number} args.stop           - planned stop-loss price
 * @param {number} [args.pipValue=10]  - value of one unit of price move per lot/unit
 * @returns {{
 *   ok: boolean,
 *   error?: string,
 *   riskAmount: number,
 *   stopDistance: number,
 *   units: number,
 *   note: string
 * }}
 */
function positionSize({ accountBalance, riskPercent, entry, stop, pipValue = 10 }) {
  // Guards — bad input should never produce a "safe" number.
  const nums = { accountBalance, riskPercent, entry, stop, pipValue };
  for (const [key, val] of Object.entries(nums)) {
    if (typeof val !== 'number' || !Number.isFinite(val)) {
      return badSize(`"${key}" must be a real number`);
    }
  }
  if (accountBalance <= 0) return badSize('Account balance must be greater than 0');
  if (riskPercent <= 0) return badSize('Risk percent must be greater than 0');
  if (riskPercent > 100) return badSize('Risk percent cannot be above 100');
  if (pipValue <= 0) return badSize('Pip/point value must be greater than 0');

  const stopDistance = Math.abs(entry - stop);
  if (stopDistance === 0) return badSize('Entry and stop cannot be the same price');

  const riskAmount = accountBalance * (riskPercent / 100);
  const units = riskAmount / (stopDistance * pipValue);

  // A gentle nudge when someone risks a lot per trade.
  let note = 'Risk looks reasonable.';
  if (riskPercent > 2) note = 'Heads up: risking more than 2% per trade is aggressive for beginners.';
  if (riskPercent > 5) note = 'Warning: risking over 5% per trade can blow an account fast.';

  return {
    ok: true,
    riskAmount: round(riskAmount, 2),
    stopDistance: round(stopDistance, 5),
    units: round(units, 2),
    note,
  };
}

function badSize(error) {
  return { ok: false, error, riskAmount: 0, stopDistance: 0, units: 0, note: error };
}

// -----------------------------------------------------------------------------
// Revenge-trade cooldown guard
// -----------------------------------------------------------------------------

/**
 * Decide whether a trader should step away after a losing streak. Chasing losses
 * ("revenge trading") is one of the top account killers, so we call a timeout.
 *
 * @param {number} recentLosses - number of losing trades in a row right now
 * @returns {{ cooldown: boolean, minutes: number, message: string }}
 */
function revengeGuard(recentLosses) {
  const losses = Number.isFinite(recentLosses) ? Math.max(0, Math.floor(recentLosses)) : 0;

  if (losses >= 4) {
    return {
      cooldown: true,
      minutes: 1440, // done for the day
      message: 'Four losses in a row. Stop trading for today. Come back tomorrow with a clear head.',
    };
  }
  if (losses >= 3) {
    return {
      cooldown: true,
      minutes: 120,
      message: 'Three losses in a row. Take a 2-hour break. The market will still be here.',
    };
  }
  if (losses >= 2) {
    return {
      cooldown: true,
      minutes: 30,
      message: 'Two losses in a row. Take 30 minutes. Do not size up to "win it back".',
    };
  }
  return {
    cooldown: false,
    minutes: 0,
    message: 'No cooldown needed. Keep following your plan.',
  };
}

// -----------------------------------------------------------------------------
// Pre-trade checklist
// -----------------------------------------------------------------------------

/**
 * The short list a trader should tick off before hitting buy or sell. Kept plain
 * so a total beginner can read it out loud.
 *
 * @returns {string[]}
 */
function checklist() {
  return [
    'Is my stop-loss set before I enter?',
    'Am I risking 1% or less of my account on this trade?',
    'Is my reward at least as big as my risk?',
    'Is there any high-impact news in the next 15 minutes?',
    'Am I trading my plan, or chasing a feeling?',
    'Have I already hit my max trades or max loss for today?',
  ];
}

// -----------------------------------------------------------------------------
// Small helpers
// -----------------------------------------------------------------------------

function round(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

module.exports = {
  RED_FLAGS,
  checkOffer,
  positionSize,
  revengeGuard,
  checklist,
};
