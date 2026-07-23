# 🛡️ OXY Account Guardian

**Watches your live funded account and warns you *before* you break a rule — not after the account is already failed.**

The [Risk Governor](../src/lib/risk-governor.js) checks one trade before you take it. The Guardian watches the **whole account, live**. It connects (read-only) to your broker, tracks your equity against your prop firm's rules, and messages you the second you cross into the danger zone:

```
🦺 OXY Account Guardian — My Topstep 50K (Topstep)

🔴 90% of your daily loss limit used — only $100 left before you fail
   the account. One more losing trade could do it. Walk away.

Equity $49,100 · today −$900
```

Most funded accounts don't die from one bad trade — they die because nobody was watching the line at 2am. This is the thing watching the line.

## What it does

- 🔴 **Live daily-loss watch** — warns at 70% (heads-up), 90% (danger), 100% (breached) of your limit.
- 📉 **Drawdown-floor watch** — warns as equity approaches your minimum-balance / trailing floor.
- 🟢 **Profit-lock + payout alerts** — "you're green, bank it" and "payout target hit, withdraw."
- 📲 **Telegram alerts** — straight to your phone, only when the level escalates (no spam).
- 🔒 **Read-only** — it reads your account state. It **never** places, modifies, or closes an order.

## Free & self-hosted (this folder)

Run it on your own machine, with your own broker login and your own Telegram bot. Node 18+.

```bash
# 1. Make your config from the example
cp guardian/config.example.json guardian/config.json
#    → fill in your TradeLocker email/password/server, your rule pack (TOPSTEP_50K, APEX_50K, TPT_PRO_100K),
#      and your Telegram bot token + chat id.

# 2. Run it
node guardian/guardian.js
```

It polls every `pollSeconds` (default 60), tracks each account's daily baseline, and alerts on escalation. Your creds and runtime state stay local (both are git-ignored).

**Get a Telegram bot in 60s:** message [@BotFather](https://t.me/BotFather) → `/newbot` → paste the token into your config. Message your new bot once so it can reach you.

Test it without a live account (fires real alerts to your Telegram):

```bash
TG_TOKEN=your-bot-token TG_CHAT=your-chat-id node guardian/test-sim.js
```

## Supported

- **Brokers:** any TradeLocker broker (Genesis FX and others — set your `server`). More adapters welcome via PR.
- **Rule packs:** TakeProfitTrader, Topstep, Apex (see [../rule-packs](../rule-packs)). Add your firm in one PR.

## Don't want to babysit it yourself?

A seatbelt you can unbuckle when you're tilting is worth nothing. **OXY hosts the Guardian for you** — it watches your account 24/7 from our servers, so it's still guarding you at 2am when you've closed your laptop, and you can't quietly turn it off in a weak moment. → **[oxyalgo.com/seatbelt](https://oxyalgo.com/seatbelt)**

## ⚠️ Disclaimer

Risk-management tooling only. Not financial advice. It is a heuristic aid — always verify your firm's current rules yourself, and you remain responsible for your account. Rule-pack numbers are community-maintained; confirm them against your firm's rulebook.
