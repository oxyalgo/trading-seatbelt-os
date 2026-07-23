"use strict";

/**
 * Account Guardian — live-account evaluator.
 *
 * The Risk Governor checks ONE proposed trade. The Guardian watches the WHOLE
 * account, live, and warns you BEFORE you break a rule — the moment you enter
 * the danger zone, not after the account is already failed.
 *
 * Pure function: given the account's current state, its rule pack, and the
 * equity it started the trading day at, it returns a severity level + the exact
 * warnings to send. No I/O.
 *
 * Levels: SAFE · WARN (heads-up) · DANGER (one more mistake fails you) · BREACH (rule broken).
 */

const LEVEL = Object.freeze({ SAFE: "SAFE", WARN: "WARN", DANGER: "DANGER", BREACH: "BREACH" });
const RANK = { SAFE: 0, WARN: 1, DANGER: 2, BREACH: 3 };

function money(v) {
  return `$${Number(v).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

/**
 * @param {object} input
 * @param {{balance:number, equity:number, openPL:number}} input.status  live account state
 * @param {object} input.policy      a rule pack (see ../rule-packs)
 * @param {number} input.dayStartEquity  equity at the day's reset (for daily-loss math)
 */
function evaluateAccount({ status, policy, dayStartEquity }) {
  const equity = Number(status.equity);
  const balance = Number(status.balance);
  const dayStart = Number(dayStartEquity ?? balance);
  const dailyPnl = equity - dayStart; // realized + open, since the reset

  const alerts = [];
  let level = LEVEL.SAFE;
  const bump = (l) => { if (RANK[l] > RANK[level]) level = l; };

  // ── Daily loss limit — the #1 account killer ──
  if (policy.maxDailyLoss && policy.maxDailyLoss < 900000) {
    const lossUsed = Math.max(0, -dailyPnl);
    const ratio = lossUsed / policy.maxDailyLoss;
    const remaining = policy.maxDailyLoss - lossUsed;
    if (ratio >= 1) {
      bump(LEVEL.BREACH);
      alerts.push(`⛔ DAILY LOSS LIMIT HIT — down ${money(lossUsed)} of ${money(policy.maxDailyLoss)}. Stop now. Do not take another trade today.`);
    } else if (ratio >= 0.9) {
      bump(LEVEL.DANGER);
      alerts.push(`🔴 ${Math.round(ratio * 100)}% of your daily loss limit used — only ${money(remaining)} left before you fail the account. One more losing trade could do it. Walk away.`);
    } else if (ratio >= 0.7) {
      bump(LEVEL.WARN);
      alerts.push(`🟡 Heads up — you're down ${money(lossUsed)}, ${Math.round(ratio * 100)}% of your ${money(policy.maxDailyLoss)} daily limit. ${money(remaining)} of room left. Tighten up.`);
    }
  }

  // ── Minimum balance / trailing drawdown floor ──
  if (policy.minAccountBalance) {
    const buffer = equity - policy.minAccountBalance;
    const roomRef = policy.maxDailyLoss && policy.maxDailyLoss < 900000 ? policy.maxDailyLoss : (policy.accountSize * 0.02 || 1000);
    if (buffer <= 0) {
      bump(LEVEL.BREACH);
      alerts.push(`⛔ MINIMUM BALANCE BREACHED — equity ${money(equity)} is at/below the ${money(policy.minAccountBalance)} floor. Account failed.`);
    } else if (buffer <= roomRef * 0.3) {
      bump(LEVEL.DANGER);
      alerts.push(`🔴 Only ${money(buffer)} above your ${money(policy.minAccountBalance)} drawdown floor. You're one bad trade from blowing it. Protect the account.`);
    } else if (buffer <= roomRef * 0.6) {
      bump(LEVEL.WARN);
      alerts.push(`🟡 ${money(buffer)} above your drawdown floor (${money(policy.minAccountBalance)}). Getting tight — trade small.`);
    }
  }

  // ── Daily profit lock — protect a green day ──
  if (policy.dailyProfitLockAt && policy.dailyProfitLockAt < 900000 && dailyPnl >= policy.dailyProfitLockAt) {
    bump(LEVEL.WARN);
    alerts.push(`🟢 You're up ${money(dailyPnl)} today — past your profit-lock. Bank the win and stop. Don't give it back.`);
  }

  // ── Payout buffer reached ──
  if (policy.normalWithdrawalBuffer && equity >= policy.normalWithdrawalBuffer) {
    bump(LEVEL.WARN);
    alerts.push(`💰 Payout target reached — equity ${money(equity)} is at/above ${money(policy.normalWithdrawalBuffer)}. Stop trading and request your withdrawal.`);
  }

  return {
    level,
    alerts,
    metrics: { equity, balance, dailyPnl, dayStartEquity: dayStart },
  };
}

module.exports = { evaluateAccount, LEVEL, RANK };
