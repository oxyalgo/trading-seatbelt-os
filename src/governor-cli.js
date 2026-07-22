#!/usr/bin/env node
"use strict";

/**
 * Risk Governor CLI.
 *
 *   node src/governor-cli.js <trade.json>
 *   node src/governor-cli.js --list        # list available rule packs
 *
 * The JSON file describes the account, the proposed trade, market state, and
 * portfolio. It either includes a full `policy` object, or a `policyId` that
 * maps to a bundled prop-firm rule pack. See examples/sample-trade.json.
 */

const fs = require("fs");
const path = require("path");
const { evaluateTrade } = require("./lib/risk-governor");
const { getPolicy, listPolicies } = require("../rule-packs");

const arg = process.argv[2];

if (!arg || arg === "-h" || arg === "--help") {
  console.log("Usage: node src/governor-cli.js <trade.json>");
  console.log("       node src/governor-cli.js --list");
  process.exit(arg ? 0 : 2);
}

if (arg === "--list") {
  console.log("Available rule packs:");
  for (const p of listPolicies()) {
    console.log(`  ${p.id.padEnd(16)} ${p.firm} ($${p.accountSize.toLocaleString("en-US")})`);
  }
  process.exit(0);
}

const inputPath = path.resolve(process.cwd(), arg);
const input = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const policy = input.policy || getPolicy(input.policyId || "TPT_PRO_100K");
const result = evaluateTrade({ ...input, policy });

const icon = { ALLOW: "✅", BLOCK: "⛔", REDUCE_SIZE: "✂️", REQUIRE_APPROVAL: "✋", LOCK_PAYOUT: "🔒" };
console.log(`\n${icon[result.mode] || ""}  ${result.mode}  (${policy.firm} · ${policy.id})`);
for (const r of result.reasons) {
  const mark = r.severity === "hard" ? "✗" : r.severity === "warn" ? "!" : "·";
  console.log(`  ${mark} ${r.code}: ${r.message}`);
}
for (const a of result.actions) {
  console.log(`  → ${a}`);
}
console.log();
console.log(JSON.stringify(result, null, 2));
