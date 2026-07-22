"use strict";

/**
 * Rule pack: Topstep (futures)
 *
 * ⚠️  COMMUNITY-MAINTAINED STARTING POINT — NOT OFFICIAL, NOT ADVICE.
 *     Verify every number against Topstep's CURRENT rulebook before trusting it.
 *     Numbers marked `VERIFY` are best-effort and change often — PRs welcome.
 *
 * Topstep uses a *trailing* max drawdown that follows your peak balance. This
 * engine treats it as a fixed floor (`minAccountBalance`); to be accurate you
 * should recompute `minAccountBalance` from your current trailing threshold each
 * day. See rule-packs/README.md → "Trailing drawdown".
 */

const policies = {
  TOPSTEP_50K: {
    id: "TOPSTEP_50K",
    firm: "Topstep",
    phase: "COMBINE",
    accountSize: 50000,
    minAccountBalance: 48000,       // VERIFY: 50k start - ~$2,000 max loss limit (trailing)
    normalWithdrawalBuffer: 53000,  // VERIFY: ~$3,000 profit target on the 50k combine
    profitSplitPercent: 90,         // VERIFY: first payouts / split terms
    maxContracts: 5,                // VERIFY: 50k contract limit
    maxOpenPositions: 3,
    maxTradesPerDay: 20,            // no hard cap published; conservative default
    maxDailyLoss: 1000,             // VERIFY: ~$1,000 daily loss limit on the 50k
    dailyProfitLockAt: 3000,        // optional self-imposed daily profit lock
    dailyGivebackLimit: 0,
    flattenBeforeHourET: 15,
    noHoldPastHourET: 16,           // VERIFY: end-of-day flat requirement
    manualApprovalRequired: false,
    automationAllowed: true,
    allowedProducts: ["CME", "COMEX", "NYMEX", "CBOT"],
    newsLockoutMinutesBefore: 0,
    newsLockoutMinutesAfter: 0,
    payoutMode: {
      stopTradingAtOrAboveBuffer: false,
      protectBufferAfterReached: true,
      minimumSurplusBeforeNewTrade: 300
    }
  }
};

module.exports = policies;
