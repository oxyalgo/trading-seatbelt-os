"use strict";

/**
 * Risk Governor — the pre-trade check that stops you before you break your own
 * (or your prop firm's) rules.
 *
 * Read-only by design: it never places, modifies, or closes an order. It answers
 * one question — "should this account be allowed to take this trade right now?"
 * — and returns a deterministic decision you can wire in front of any executor,
 * copier, bot action, or manual checklist.
 *
 * No dependencies. Pure functions. Same input always gives the same answer.
 */

const DECISION = Object.freeze({
  ALLOW: "ALLOW",
  BLOCK: "BLOCK",
  REQUIRE_APPROVAL: "REQUIRE_APPROVAL",
  REDUCE_SIZE: "REDUCE_SIZE",
  LOCK_PAYOUT: "LOCK_PAYOUT"
});

const SEVERITY = Object.freeze({
  INFO: "info",
  WARN: "warn",
  HARD: "hard"
});

function evaluateTrade(input) {
  const policy = input.policy;
  const account = input.account || {};
  const trade = input.trade || {};
  const market = input.market || {};
  const portfolio = input.portfolio || {};

  if (!policy) throw new Error("policy is required");

  const reasons = [];
  const actions = [];

  const balance = number(account.balance, policy.accountSize);
  const equity = number(account.equity, balance);
  const openPnl = number(account.openPnl, equity - balance);
  const dailyPnl = number(account.dailyPnl, 0);
  const contracts = Math.max(0, number(trade.contracts, 0));
  const openPositions = number(account.openPositions, 0);
  const tradesToday = number(account.tradesToday, 0);
  const worstCaseLoss = Math.max(0, number(trade.worstCaseLoss, 0));
  const exchange = String(trade.exchange || "").toUpperCase();
  const now = market.now ? new Date(market.now) : new Date();

  if (policy.payoutMode?.stopTradingAtOrAboveBuffer && equity >= policy.normalWithdrawalBuffer) {
    reasons.push(reason(SEVERITY.HARD, "PAYOUT_BUFFER_REACHED", `Equity ${money(equity)} is at/above withdrawal buffer ${money(policy.normalWithdrawalBuffer)}.`));
    actions.push("Stop trading this account and request withdrawal.");
    return decision(DECISION.LOCK_PAYOUT, reasons, actions, { maxContracts: 0, equity, balance, openPnl });
  }

  if (policy.manualApprovalRequired) {
    reasons.push(reason(SEVERITY.WARN, "MANUAL_APPROVAL_REQUIRED", "This account policy requires a human to approve/execute the trade manually."));
    actions.push("Route as alert-only / human approval, not auto-execution.");
  }

  if (policy.automationAllowed === false && trade.executionMode === "auto") {
    reasons.push(reason(SEVERITY.HARD, "AUTO_EXECUTION_DISABLED", "Automation is disabled for this account policy."));
    actions.push("Block executor; send signal only.");
  }

  if (balance <= policy.minAccountBalance) {
    reasons.push(reason(SEVERITY.HARD, "BELOW_MIN_BALANCE", `Balance ${money(balance)} is at/below minimum ${money(policy.minAccountBalance)}.`));
  }

  if ((equity - worstCaseLoss) < policy.minAccountBalance) {
    reasons.push(reason(SEVERITY.HARD, "TRADE_CAN_BREAK_MIN_BALANCE", `Worst case would put equity below ${money(policy.minAccountBalance)}.`));
  }

  if (policy.payoutMode?.protectBufferAfterReached) {
    const distanceToBuffer = policy.normalWithdrawalBuffer - equity;
    if (distanceToBuffer <= policy.payoutMode.minimumSurplusBeforeNewTrade && worstCaseLoss > 0) {
      reasons.push(reason(SEVERITY.WARN, "NEAR_PAYOUT_BUFFER", `Only ${money(distanceToBuffer)} from payout buffer; new risk should be minimized.`));
      actions.push("Prefer no new trades; protect the payout path.");
    }
  }

  if (dailyPnl <= -Math.abs(policy.maxDailyLoss)) {
    reasons.push(reason(SEVERITY.HARD, "DAILY_LOSS_LIMIT_HIT", `Daily PnL ${money(dailyPnl)} breached max daily loss ${money(policy.maxDailyLoss)}.`));
  }

  if (dailyPnl >= policy.dailyProfitLockAt) {
    reasons.push(reason(SEVERITY.HARD, "DAILY_PROFIT_LOCK", `Daily PnL ${money(dailyPnl)} reached profit lock ${money(policy.dailyProfitLockAt)}.`));
    actions.push("Stop trading for the day; keep the win.");
  }

  if (contracts > policy.maxContracts) {
    reasons.push(reason(SEVERITY.HARD, "MAX_CONTRACTS_EXCEEDED", `${contracts} contracts exceeds policy max ${policy.maxContracts}.`));
  }

  if (openPositions >= policy.maxOpenPositions && !trade.isExit) {
    reasons.push(reason(SEVERITY.HARD, "MAX_OPEN_POSITIONS_REACHED", `${openPositions} open positions already meets max ${policy.maxOpenPositions}.`));
  }

  if (tradesToday >= policy.maxTradesPerDay && !trade.isExit) {
    reasons.push(reason(SEVERITY.HARD, "MAX_TRADES_PER_DAY_REACHED", `${tradesToday} trades today meets max ${policy.maxTradesPerDay}.`));
  }

  if (policy.allowedProducts?.length && exchange && !policy.allowedProducts.includes(exchange)) {
    reasons.push(reason(SEVERITY.HARD, "PRODUCT_NOT_ALLOWED", `${exchange} is not in allowed products: ${policy.allowedProducts.join(", ")}.`));
  }

  if (market.highImpactNewsWithinMinutes != null) {
    const minutes = Math.abs(number(market.highImpactNewsWithinMinutes, 999));
    const lockout = Math.max(policy.newsLockoutMinutesBefore || 0, policy.newsLockoutMinutesAfter || 0);
    if (minutes <= lockout) {
      reasons.push(reason(SEVERITY.HARD, "NEWS_LOCKOUT", `High-impact news is within ${minutes} minutes.`));
    }
  }

  const etHour = typeof market.hourET === "number" ? market.hourET : getEasternHour(now);
  if (etHour >= policy.noHoldPastHourET && !trade.isExit) {
    reasons.push(reason(SEVERITY.HARD, "NO_HOLD_WINDOW", `New trades blocked at/after ${policy.noHoldPastHourET}:00 ET.`));
  } else if (etHour >= policy.flattenBeforeHourET && !trade.isExit) {
    reasons.push(reason(SEVERITY.WARN, "LATE_SESSION", `Late session after ${policy.flattenBeforeHourET}:00 ET; prefer flat/protective actions only.`));
  }

  const correlation = portfolio.correlatedOpenRisk || 0;
  if (correlation > 0 && !trade.isExit) {
    reasons.push(reason(SEVERITY.WARN, "CORRELATED_RISK", `Correlated open risk exists: ${money(correlation)}.`));
  }

  const hard = reasons.some((r) => r.severity === SEVERITY.HARD);
  const maxContracts = Math.max(0, Math.min(policy.maxContracts, contracts || policy.maxContracts));

  if (hard) {
    return decision(DECISION.BLOCK, reasons, actions, { maxContracts: 0, equity, balance, openPnl });
  }

  if (contracts > maxContracts) {
    actions.push(`Reduce to ${maxContracts} contracts or less.`);
    return decision(DECISION.REDUCE_SIZE, reasons, actions, { maxContracts, equity, balance, openPnl });
  }

  if (policy.manualApprovalRequired || reasons.some((r) => r.severity === SEVERITY.WARN)) {
    return decision(DECISION.REQUIRE_APPROVAL, reasons, actions, { maxContracts, equity, balance, openPnl });
  }

  return decision(DECISION.ALLOW, reasons, actions, { maxContracts, equity, balance, openPnl });
}

function decision(mode, reasons, actions, metrics) {
  return {
    mode,
    allowed: mode === DECISION.ALLOW,
    requiresHuman: mode === DECISION.REQUIRE_APPROVAL,
    reasons,
    actions,
    metrics
  };
}

function reason(severity, code, message) {
  return { severity, code, message };
}

function number(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function money(value) {
  return `$${Number(value).toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
}

function getEasternHour(date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    hour12: false
  }).formatToParts(date);
  return Number(parts.find((p) => p.type === "hour")?.value || 0);
}

module.exports = {
  DECISION,
  SEVERITY,
  evaluateTrade
};
