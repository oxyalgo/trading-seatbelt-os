"use strict";

const fs = require("fs");
const path = require("path");
const { evaluateAccount, RANK } = require("./evaluate");
const { sendAlert } = require("./telegram");
const { getPolicy } = require("../rule-packs");
const { makeTradeLockerReader } = require("./adapters/tradelocker");
const { makeSimulatorReader } = require("./adapters/simulator");

const STATE_FILE = path.join(__dirname, ".state.json");
const REALERT_MS = 15 * 60 * 1000; // re-nudge DANGER/BREACH at most every 15 min

/* ── Session day: prop daily limits reset at `resetHourET` (default 5pm ET). ── */
function etParts(d) {
  const p = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hour12: false,
  }).formatToParts(d);
  const g = (t) => Number(p.find((x) => x.type === t).value);
  return { y: g("year"), m: g("month"), day: g("day"), hour: g("hour") };
}
function sessionKey(resetHourET, now) {
  const { y, m, day, hour } = etParts(now);
  let base = Date.UTC(y, m - 1, day);
  if (hour >= resetHourET) base += 86400000; // rolls to next session at the reset hour
  const dt = new Date(base);
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(dt.getUTCDate()).padStart(2, "0")}`;
}

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, "utf8")); } catch { return {}; }
}
function saveState(s) {
  try { fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2)); } catch { /* best effort */ }
}

function buildReader(account) {
  if (account.broker === "tradelocker") return makeTradeLockerReader(account.tradelocker);
  if (account.broker === "simulator") return makeSimulatorReader(account.steps || []);
  throw new Error(`Unknown broker: ${account.broker}`);
}

function money(v) { return `$${Number(v).toLocaleString("en-US", { maximumFractionDigits: 0 })}`; }

/**
 * Evaluate one account once and alert if it just escalated (or a DANGER/BREACH
 * that hasn't been re-nudged in 15 min). Mutates `state` for this account.
 * Returns { level, alerts, alerted }.
 */
async function tickAccount(account, reader, state, now = new Date()) {
  const st = state[account.label] || { sessionKey: null, dayStartEquity: null, lastLevel: "SAFE", lastAlertTs: 0 };
  const status = await reader();
  const policy = account.policy || getPolicy(account.rulePackId); // inline policy or a named rule pack
  const key = sessionKey(account.resetHourET || 17, now);

  if (st.sessionKey !== key) {
    st.sessionKey = key;
    st.dayStartEquity = status.equity; // baseline for daily-loss math
    st.lastLevel = "SAFE";
    st.lastAlertTs = 0;
  }

  const result = evaluateAccount({ status, policy, dayStartEquity: st.dayStartEquity });
  const escalated = RANK[result.level] > RANK[st.lastLevel];
  const reNudge = (result.level === "DANGER" || result.level === "BREACH") && now.getTime() - st.lastAlertTs > REALERT_MS;

  let alerted = false;
  if (result.level !== "SAFE" && (escalated || reNudge) && account.telegram) {
    const header = `🦺 OXY Account Guardian — ${account.label} (${policy.firm})`;
    const foot = `Equity ${money(result.metrics.equity)} · today ${result.metrics.dailyPnl >= 0 ? "+" : ""}${money(result.metrics.dailyPnl)}`;
    const text = [header, "", ...result.alerts, "", foot].join("\n");
    const sent = await sendAlert(account.telegram.token, account.telegram.chatId, text);
    alerted = !!sent.ok;
    if (alerted) st.lastAlertTs = now.getTime();
  }

  st.lastLevel = result.level;
  state[account.label] = st;
  return { level: result.level, alerts: result.alerts, alerted, metrics: result.metrics };
}

/* ── Runnable service ── */
function loadConfig() {
  const p = path.join(__dirname, "config.json");
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

async function runForever() {
  const config = loadConfig();
  const readers = new Map(config.accounts.map((a) => [a.label, buildReader(a)]));
  const pollMs = (config.pollSeconds || 60) * 1000;
  console.log(`[guardian] watching ${config.accounts.length} account(s), every ${pollMs / 1000}s`);

  // startup ping so the owner sees it go live
  const first = config.accounts[0];
  if (first?.telegram?.token && first?.telegram?.chatId) {
    await sendAlert(first.telegram.token, first.telegram.chatId,
      `🛡️ OXY Account Guardian is LIVE on the server.\nWatching ${config.accounts.length} account(s), every ${pollMs / 1000}s. You'll only get pinged when an account nears a rule.`);
  }

  async function tick() {
    const state = loadState();
    for (const account of config.accounts) {
      try {
        const r = await tickAccount(account, readers.get(account.label), state);
        console.log(`[guardian] ${account.label}: ${r.level}${r.alerted ? " (alerted)" : ""} · day ${r.metrics.dailyPnl >= 0 ? "+" : ""}${Math.round(r.metrics.dailyPnl)}`);
      } catch (e) {
        console.error(`[guardian] ${account.label}: ERROR ${e.message}`);
      }
    }
    saveState(state);
  }

  await tick();
  setInterval(tick, pollMs);
}

module.exports = { tickAccount, buildReader, sessionKey, evaluateAccount };

if (require.main === module) {
  runForever().catch((e) => { console.error(e); process.exit(1); });
}
