"use strict";

/**
 * Rule pack: Apex Trader Funding (futures)
 *
 * ⚠️  COMMUNITY-MAINTAINED STARTING POINT — NOT OFFICIAL, NOT ADVICE.
 *     Verify every number against Apex's CURRENT rulebook before trusting it.
 *     Numbers marked `VERIFY` are best-effort and change often — PRs welcome.
 *
 * Apex famously has NO daily loss limit but a *trailing* threshold that follows
 * your peak (and stops trailing once you're a set amount above start). We model
 * the trailing floor as `minAccountBalance`; recompute it from your current
 * threshold. Apex also enforces a consistency rule at payout — tracked as a note,
 * not a pre-trade block. See rule-packs/README.md.
 */

const policies = {
  APEX_50K: {
    id: "APEX_50K",
    firm: "Apex Trader Funding",
    phase: "EVALUATION",
    accountSize: 50000,
    minAccountBalance: 47500,       // VERIFY: ~$2,500 trailing threshold on the 50k
    normalWithdrawalBuffer: 53000,  // VERIFY: ~$3,000 profit target on the 50k eval
    profitSplitPercent: 90,
    maxContracts: 10,               // VERIFY: 50k contract limit (~10 minis)
    maxOpenPositions: 3,
    maxTradesPerDay: 30,            // no hard cap published; conservative default
    maxDailyLoss: 999999,           // no daily loss limit — set high so the check is inert
    dailyProfitLockAt: 999999,      // no daily profit lock — set high so the check is inert
    dailyGivebackLimit: 0,
    flattenBeforeHourET: 16,
    noHoldPastHourET: 17,           // VERIFY: end-of-day flat requirement
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
