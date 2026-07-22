"use strict";

/**
 * Rule pack: TakeProfitTrader (futures)
 *
 * ⚠️  COMMUNITY-MAINTAINED STARTING POINT — NOT OFFICIAL, NOT ADVICE.
 *     Prop firms change their rules often. Verify every number below against
 *     your firm's CURRENT rulebook before you trust it. A stale number here
 *     can cost you your account. Found one that's out of date? Open a PR —
 *     keeping these current is the whole point of this folder.
 *
 * Every field is documented so you can build a pack for any firm. All money
 * values are in account currency (USD). Times are US Eastern (ET), 24h.
 */

const policies = {
  TPT_PRO_100K: {
    id: "TPT_PRO_100K",
    firm: "TakeProfitTrader",
    phase: "PRO",
    accountSize: 100000,            // nominal starting balance
    minAccountBalance: 97000,       // hard floor — below this the account is failed
    normalWithdrawalBuffer: 103000, // equity at/above this = payout target reached
    profitSplitPercent: 80,         // your share of profits at payout
    maxContracts: 12,               // max total contracts at once
    maxOpenPositions: 1,            // max simultaneous open positions
    maxTradesPerDay: 8,             // max entries per day
    maxDailyLoss: 1200,             // stop for the day once daily PnL <= -this
    dailyProfitLockAt: 1500,        // stop for the day once daily PnL >= this (keep the win)
    dailyGivebackLimit: 500,        // informational: max you may give back from peak
    flattenBeforeHourET: 16,        // warn: prefer flat/protective actions after this hour
    noHoldPastHourET: 17,           // hard: no new trades at/after this hour
    manualApprovalRequired: true,   // this account is human-approval-only
    automationAllowed: false,       // block auto-execution on this account
    allowedProducts: ["CME", "COMEX", "NYMEX", "CBOT"], // exchanges you may trade
    newsLockoutMinutesBefore: 5,    // block this many minutes before high-impact news
    newsLockoutMinutesAfter: 5,     // ...and after
    payoutMode: {
      stopTradingAtOrAboveBuffer: true,   // lock the account once the buffer is hit
      protectBufferAfterReached: true,    // near the buffer, minimize new risk
      minimumSurplusBeforeNewTrade: 500   // cushion required before taking new risk
    }
  }
};

module.exports = policies;
