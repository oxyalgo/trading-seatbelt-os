"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { evaluateTrade, DECISION } = require("../src/lib/risk-governor");
const { getPolicy } = require("../rule-packs");

const policy = getPolicy("TPT_PRO_100K");

test("locks account once normal withdrawal buffer is reached", () => {
  const result = evaluateTrade({
    policy,
    account: { balance: 103050, equity: 103050, dailyPnl: 3050, openPositions: 0, tradesToday: 2 },
    trade: { symbol: "ES", exchange: "CME", contracts: 1, worstCaseLoss: 250, executionMode: "manual" },
    market: { hourET: 10 }
  });

  assert.equal(result.mode, DECISION.LOCK_PAYOUT);
  assert.equal(result.metrics.maxContracts, 0);
  assert.match(result.reasons[0].code, /PAYOUT_BUFFER/);
});

test("blocks automation on manual-only prop policy", () => {
  const result = evaluateTrade({
    policy,
    account: { balance: 100000, equity: 100000, dailyPnl: 0, openPositions: 0, tradesToday: 0 },
    trade: { symbol: "ES", exchange: "CME", contracts: 1, worstCaseLoss: 300, executionMode: "auto" },
    market: { hourET: 10 }
  });

  assert.equal(result.mode, DECISION.BLOCK);
  assert.ok(result.reasons.some((r) => r.code === "AUTO_EXECUTION_DISABLED"));
});

test("requires human approval for valid manual trade", () => {
  const result = evaluateTrade({
    policy,
    account: { balance: 100000, equity: 100500, dailyPnl: 500, openPositions: 0, tradesToday: 1 },
    trade: { symbol: "CL", exchange: "NYMEX", contracts: 2, worstCaseLoss: 350, executionMode: "manual" },
    market: { hourET: 11 }
  });

  assert.equal(result.mode, DECISION.REQUIRE_APPROVAL);
  assert.equal(result.requiresHuman, true);
  assert.ok(result.reasons.some((r) => r.code === "MANUAL_APPROVAL_REQUIRED"));
});

test("blocks trades that can break minimum balance", () => {
  const result = evaluateTrade({
    policy,
    account: { balance: 97200, equity: 97200, dailyPnl: -800, openPositions: 0, tradesToday: 2 },
    trade: { symbol: "NQ", exchange: "CME", contracts: 1, worstCaseLoss: 300, executionMode: "manual" },
    market: { hourET: 9 }
  });

  assert.equal(result.mode, DECISION.BLOCK);
  assert.ok(result.reasons.some((r) => r.code === "TRADE_CAN_BREAK_MIN_BALANCE"));
});

test("blocks news lockout", () => {
  const result = evaluateTrade({
    policy,
    account: { balance: 100000, equity: 100000, dailyPnl: 0, openPositions: 0, tradesToday: 0 },
    trade: { symbol: "GC", exchange: "COMEX", contracts: 1, worstCaseLoss: 200, executionMode: "manual" },
    market: { hourET: 9, highImpactNewsWithinMinutes: 3 }
  });

  assert.equal(result.mode, DECISION.BLOCK);
  assert.ok(result.reasons.some((r) => r.code === "NEWS_LOCKOUT"));
});

test("registry exposes the bundled prop-firm packs", () => {
  const { listPolicies } = require("../rule-packs");
  const ids = listPolicies().map((p) => p.id);
  assert.ok(ids.includes("TPT_PRO_100K"));
  assert.ok(ids.includes("TOPSTEP_50K"));
  assert.ok(ids.includes("APEX_50K"));
});
