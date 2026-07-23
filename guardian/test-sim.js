"use strict";

/**
 * End-to-end test with a simulated account (no live broker needed).
 * Plays a $50K Topstep account sliding into its daily-loss limit and fires the
 * real escalating Telegram alerts, so you can watch the Guardian work.
 *
 *   TG_TOKEN=... TG_CHAT=... node guardian/test-sim.js
 */

const { tickAccount, buildReader } = require("./guardian");

const account = {
  label: "PILOT-DEMO",
  broker: "simulator",
  rulePackId: "TOPSTEP_50K",
  resetHourET: 17,
  telegram: { token: process.env.TG_TOKEN || "", chatId: process.env.TG_CHAT || "" },
  // equity slides down: breakeven → 50% → 70% (WARN) → 90% (DANGER) → 105% (BREACH) of the $1,000 daily loss limit
  steps: [
    { balance: 50000, equity: 50000 },
    { balance: 49500, equity: 49500 },
    { balance: 49300, equity: 49300 },
    { balance: 49100, equity: 49100 },
    { balance: 48950, equity: 48950 },
  ],
};

(async () => {
  const reader = buildReader(account);
  const state = {};
  for (let i = 0; i < account.steps.length; i++) {
    const r = await tickAccount(account, reader, state);
    console.log(
      `step ${i}: equity ${Math.round(r.metrics.equity)} · dailyPnl ${Math.round(r.metrics.dailyPnl)} → ${r.level}${r.alerted ? " (ALERT SENT ✅)" : ""}`
    );
    if (r.alerts.length) r.alerts.forEach((a) => console.log(`   ${a}`));
    await new Promise((res) => setTimeout(res, 900)); // keep telegram messages in order
  }
  console.log("done.");
})();
