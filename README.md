# 🦺 Trading Seatbelt

### Software that stops you before you break your own trading rules.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-blueviolet.svg)](CONTRIBUTING.md)
[![Discord](https://img.shields.io/badge/chat-Discord-5865F2.svg)](CONNECT.md)

The **Trading Seatbelt** is a free, open-source safety layer for traders. It protects you from the things that actually wipe accounts — **scams, over-leverage, revenge trading, and breaking your prop firm's rules** — with a pre-trade **Risk Governor**, a scam checker, a position-size calculator, and a revenge-trade cooldown. Runs anywhere, needs zero paid services, and phones home nothing.

> **The seatbelt for traders.** It won't drive the car for you. It keeps you alive when things go wrong.

---

## Why this exists

Around **94% of retail traders lose money** — and most funded-account attempts fail on **rule violations** (daily loss, max contracts, holding past the cutoff), not bad entries. The damage is:

- 🪤 **Scams** — "guaranteed profits", fake prop-firm passes, "send me crypto and I'll trade for you".
- 💥 **Over-leverage** — risking 20% on one trade because "this one's a lock".
- 🔁 **Revenge trading** — chasing a loss with a bigger bet, then a bigger one.
- 📏 **Rule breaks** — one trade too many, one contract too big, and the funded account is gone.

A seatbelt doesn't stop you from driving. It stops a small mistake from becoming a fatal one.

---

## ✨ Features

- 🛡️ **Account Guardian** *(new)* — connects **read-only to your live funded account** and messages your phone *before* you break a rule (70% → 90% → 100% of your daily-loss limit, drawdown floor, profit-lock, payout). The thing watching the line at 2am. See **[guardian/](guardian/)**.
- 🚦 **Risk Governor** — a deterministic pre-trade check that returns **ALLOW / BLOCK / REDUCE_SIZE / REQUIRE_APPROVAL / LOCK_PAYOUT** with plain-English reasons. Enforces daily-loss limits, payout locks, max contracts/positions/trades, news lockouts, session cutoffs, and more. Read-only — it never places an order.
- 📦 **Prop-firm rule packs** *(new in v0.2)* — machine-readable rulesets for **TakeProfitTrader, Topstep, Apex**, so the Governor knows your firm's limits. Community-maintained — [add your firm in one PR](rule-packs/README.md).
- 🚨 **Scam / red-flag checker** — paste any DM, ad, or "signal group" pitch and get a 0–10 risk score with plain-English reasons.
- 🧮 **Position-size calculator** — turn "1% risk" into an actual safe lot/unit size from your balance, entry, and stop.
- 🧠 **Revenge-trade cooldown** — after a losing streak, the bot calls a timeout so you don't tilt.
- 📝 **Pre-trade checklist + post-trade review** — the short list before you click, the reflection after.
- 🎮 **Mock broker demo mode** — try everything with fake money and **zero real credentials**.
- 🤖 **Discord + Telegram** — same safety tools, both platforms, one small codebase.

---

## 🚦 Risk Governor — quick start

No bot, no tokens, no account needed. Point it at a JSON file describing a proposed trade:

```bash
git clone https://github.com/oxyalgo/trading-seatbelt-os.git
cd trading-seatbelt-os
npm install

# See which prop-firm rule packs are bundled
node src/governor-cli.js --list

# Check a trade against a firm's rules
node src/governor-cli.js examples/sample-trade.json
```

You get a decision like:

```
✋  REQUIRE_APPROVAL  (TakeProfitTrader · TPT_PRO_100K)
  ! MANUAL_APPROVAL_REQUIRED: This account policy requires a human to approve/execute manually.
  → Route as alert-only / human approval, not auto-execution.
```

Use it as a library in front of any executor, copier, or bot:

```js
const { evaluateTrade } = require("trading-seatbelt-os/src/lib/risk-governor");
const { getPolicy } = require("trading-seatbelt-os/rule-packs");

const result = evaluateTrade({
  policy: getPolicy("TOPSTEP_50K"),
  account: { balance: 50000, equity: 49200, dailyPnl: -800, openPositions: 0, tradesToday: 3 },
  trade: { symbol: "ES", exchange: "CME", contracts: 2, worstCaseLoss: 300 },
  market: { hourET: 11 }
});

if (!result.allowed) console.log(result.mode, result.reasons);
```

> ⚠️ Rule packs are **community-maintained starting points, not official**. Verify every number against your firm's current rulebook — [details here](rule-packs/README.md).

---

## 🤖 Bot quick start (Discord / Telegram)

```bash
cp .env.example .env    # add your bot token(s)
npm start               # runs whichever bots have tokens set
```

No tokens yet? It still runs and exits cleanly with instructions — it never crash-loops. Run one platform with `npm run start:discord` or `npm run start:telegram`. Docker: `docker compose up -d`. Tests: `npm test`.

### Config

Copy `.env.example` to `.env` and fill in what you need. Set **either** platform, **both**, or **neither** (with neither, the app prints a friendly message and exits 0).

| Env var | What it does | Required |
| --- | --- | --- |
| `DISCORD_TOKEN` | Your Discord bot token | For Discord |
| `DISCORD_CLIENT_ID` | Your Discord application (client) ID | For Discord |
| `TELEGRAM_BOT_TOKEN` | Your Telegram bot token from @BotFather | For Telegram |
| `OWNER_ID` | Your own account ID, for owner-only actions | Optional |

### Commands

| Discord | Telegram | What it does |
| --- | --- | --- |
| `/start` | `/start` | Beginner onboarding |
| `/scamcheck text:<offer>` | `/scamcheck <text>` | Score a pasted offer for scam red flags (0–10) |
| `/risk balance risk% entry stop [pip_value]` | `/risk <balance> <risk%> <entry> <stop>` | Safe position size from your risk plan |
| `/check` | — | Run the pre-trade seatbelt checklist |
| `/review [recent_losses]` | — | Post-trade reflection + revenge-trade cooldown check |

---

## 🧩 Open-core

The **safety layer is free and open forever.** That's this repo.

| Free & open (this repo) | Paid product (separate) |
| --- | --- |
| Risk Governor (read-only pre-trade check) | Live order-flow signal engine |
| Prop-firm rule packs | Trade execution & routing |
| Scam / red-flag checker | Automated risk management on **live** accounts |
| Position-size calculator | Hosted multi-account dashboard |
| Pre-trade checklist + revenge-trade cooldown | — |
| Mock broker demo | — |

The live signal and execution engine ships as a separate product, **OXY ALGO**. This repo intentionally contains **no live trading, signal, or execution code** — only the seatbelt. Keeping the safety tools open helps every trader, whether or not they ever pay for anything.

---

## 🔗 Connect

The Seatbelt asks for nothing and sends nothing. If you *want* the maintained prop-firm rule packs (with alerts when a firm changes a rule) or the community, both are optional and opt-in — see **[CONNECT.md](CONNECT.md)**.

Running a beginner-friendly trading community? See **[docs/COMMUNITY-SETUP.md](docs/COMMUNITY-SETUP.md)** for a safe channel layout. Full install docs live in **[docs/SETUP.md](docs/SETUP.md)**.

---

## 🗺️ Roadmap

- [x] Risk Governor (pre-trade ALLOW/BLOCK/REDUCE engine)
- [x] Prop-firm rule packs (TakeProfitTrader, Topstep, Apex)
- [x] Daily loss-limit + payout-lock enforcement
- [x] Scam / red-flag checker
- [x] Position-size calculator
- [x] Revenge-trade cooldown
- [x] Mock broker demo mode
- [x] Discord + Telegram support
- [ ] `/governor` slash command in the bots
- [ ] Trailing-drawdown auto-recompute helper (Topstep / Apex)
- [ ] Forex / percentage-drawdown rule-pack variant (FTMO-style firms)
- [ ] Personal trade journal export
- [ ] Web dashboard for community mods
- [ ] More languages

---

## ⚠️ Disclaimer

Education and risk-management tooling only. **Not financial advice. No guaranteed profits. Trading involves substantial risk of loss.** You are responsible for your own decisions. The scam checker and rule packs are heuristic aids, not legal or financial judgments — always do your own due diligence and verify prop-firm rules against the firm's current rulebook.

---

## ⭐ Star this repo

If this could save one trader from blowing their account, **give it a star** — it helps more people find their seatbelt. PRs and rule-pack contributions welcome.
