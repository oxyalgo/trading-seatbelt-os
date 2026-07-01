# 🦺 Trading Seatbelt

### I built a bot that stops beginners from blowing their trading accounts.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-blueviolet.svg)](CONTRIBUTING.md)
[![Discord](https://img.shields.io/badge/chat-Discord-5865F2.svg)](#-community-setup)

The **Trading Seatbelt** is a free, open-source Discord + Telegram bot that protects new traders from the three things that actually wipe accounts: **scams, over-leverage, and revenge trading.** It runs anywhere, needs zero paid services, and ships with a **mock broker demo mode** so anyone can try it in 60 seconds with no real credentials.

> **The seatbelt for retail traders.** It won't drive the car for you. It keeps you alive when things go wrong.

![screenshot](docs/img/scamcheck.png)

---

## Why this exists

Around **94% of retail traders lose money.** But most of the damage isn't bad entries — it's:

- 🪤 **Scams** — "guaranteed profits", fake prop-firm passes, "send me crypto and I'll trade for you".
- 💥 **Over-leverage** — risking 20% on one trade because "this one's a lock".
- 🔁 **Revenge trading** — chasing a loss with a bigger bet, then a bigger one.

A seatbelt doesn't stop you from driving. It stops a small mistake from becoming a fatal one. That's what this bot does.

---

## ✨ Features

- 🚨 **Scam / red-flag checker** — paste any DM, ad, or "signal group" pitch and get a 0–10 risk score with plain-English reasons.
- 🧮 **Position-size calculator** — turn "1% risk" into an actual safe lot/unit size from your balance, entry, and stop.
- 🦺 **Pre-trade checklist** — the short list you tick off *before* you click buy or sell.
- 🧠 **Revenge-trade cooldown** — after a losing streak, the bot calls a timeout so you don't tilt.
- 📝 **Post-trade review** — reflection prompts that turn losses into lessons.
- 🎮 **Mock broker demo mode** — try everything with fake money and **zero real credentials**.
- 🤖 **Discord + Telegram** — same safety tools, both platforms, one small codebase.

---

## 🚀 Quick start (Docker, one command)

```bash
git clone https://github.com/your-org/trading-seatbelt-os.git
cd trading-seatbelt-os
cp .env.example .env    # add your bot token(s)
docker compose up -d
```

No tokens yet? It still runs and exits cleanly with instructions — it never crash-loops.

## 🚀 Quick start (Node)

```bash
git clone https://github.com/your-org/trading-seatbelt-os.git
cd trading-seatbelt-os
npm install
cp .env.example .env    # add your bot token(s)
npm start               # runs whichever bots have tokens set
```

Run just one platform:

```bash
npm run start:discord
npm run start:telegram
```

Run the tests:

```bash
npm test
```

---

## ⚙️ Config

Copy `.env.example` to `.env` and fill in what you need. Every value is a fake placeholder until you set it.

| Env var | What it does | Required |
| --- | --- | --- |
| `DISCORD_TOKEN` | Your Discord bot token | For Discord |
| `DISCORD_CLIENT_ID` | Your Discord application (client) ID, used to register slash commands | For Discord |
| `TELEGRAM_BOT_TOKEN` | Your Telegram bot token from @BotFather | For Telegram |
| `OWNER_ID` | Your own account ID, for owner-only actions | Optional |

You can set **either** platform, **both**, or **neither**. With neither set, the app prints a friendly message and exits 0.

---

## 💬 Commands

### Discord (slash commands)

| Command | What it does |
| --- | --- |
| `/start` | Beginner onboarding — what the seatbelt is and how to use it |
| `/scamcheck text:<offer>` | Score a pasted offer for scam red flags (0–10) |
| `/risk balance risk_percent entry stop [pip_value]` | Safe position size from your risk plan |
| `/check` | Run the pre-trade seatbelt checklist |
| `/review [recent_losses]` | Post-trade reflection + revenge-trade cooldown check |

### Telegram

| Command | What it does |
| --- | --- |
| `/start` | Beginner onboarding |
| `/scamcheck <text>` | Score a pasted offer for scam red flags |
| `/risk <balance> <risk%> <entry> <stop> [pip_value]` | Safe position size |

---

## 🧩 Open-core

The **safety layer is free and open forever.** That's this repo.

| Free & open (this repo) | Paid product (separate) |
| --- | --- |
| Scam / red-flag checker | Live order-flow signal engine |
| Position-size calculator | Trade execution & routing |
| Pre-trade checklist | Automated risk management on live accounts |
| Revenge-trade cooldown | Prop-firm & multi-account tooling |
| Mock broker demo | — |

The live signal and execution engine ships as a separate product, **OXY ALGO**. This repo intentionally contains **no live trading, signal, or execution code** — only the seatbelt. Keeping the safety tools open helps every beginner, whether or not they ever pay for anything.

---

## 🏠 Community setup

Running a beginner-friendly trading community? See **[docs/COMMUNITY-SETUP.md](docs/COMMUNITY-SETUP.md)** for a safe, generic channel layout (start-here, rules, risk-pledge, scam-alerts, seatbelt-tools, classroom, community, support) and how to wire the bot in.

Full install and run docs live in **[docs/SETUP.md](docs/SETUP.md)**.

---

## 🗺️ Roadmap

- [x] Scam / red-flag checker
- [x] Position-size calculator
- [x] Pre-trade checklist
- [x] Revenge-trade cooldown
- [x] Mock broker demo mode
- [x] Discord + Telegram support
- [ ] Daily loss-limit tracker
- [ ] Personal trade journal export
- [ ] Broker-agnostic account read-only balance check
- [ ] Web dashboard for community mods
- [ ] More languages

---

## ⚠️ Disclaimer

Education and risk-management tooling only. **Not financial advice. No guaranteed profits. Trading involves substantial risk of loss.** You are responsible for your own decisions. The scam checker is a heuristic aid, not a legal or financial judgment — always do your own due diligence.

---

## ⭐ Star this repo

If this could save one beginner from blowing their account, **give it a star** — it helps more people find their seatbelt. PRs and ideas welcome.
