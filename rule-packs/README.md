# 📦 Prop-Firm Rule Packs

Machine-readable rulesets for the major prop firms, so the [Risk Governor](../src/lib/risk-governor.js) can stop you **before** you break a rule and blow your account.

> ⚠️ **These are community-maintained starting points — NOT official, NOT financial advice.**
> Prop firms change their rules all the time. **Verify every number against your firm's current rulebook before you trust it.** A stale number here can cost you your funded account. Numbers we're unsure about are marked `VERIFY` in each file. Found one that's wrong or out of date? **Open a PR** — that's the whole point of this folder.

## Included packs

| Policy id | Firm | Account |
| --- | --- | --- |
| `TPT_PRO_100K` | TakeProfitTrader | $100k PRO |
| `TOPSTEP_50K` | Topstep | $50k Combine |
| `APEX_50K` | Apex Trader Funding | $50k Evaluation |

More firms and account sizes are added by the community — see "Contribute a pack" below. FTMO / forex-style firms use **percentage** drawdowns and lot sizing instead of contracts; a forex variant of the schema is on the roadmap (PRs welcome).

## The schema

Every field, in account currency (USD), times in US Eastern (ET, 24h):

| Field | Meaning |
| --- | --- |
| `accountSize` | Nominal starting balance |
| `minAccountBalance` | Hard floor — below this the account is failed |
| `normalWithdrawalBuffer` | Equity at/above this = payout target reached (account locks) |
| `maxContracts` | Max total contracts at once |
| `maxOpenPositions` | Max simultaneous open positions |
| `maxTradesPerDay` | Max entries per day |
| `maxDailyLoss` | Stop for the day once daily PnL ≤ −this |
| `dailyProfitLockAt` | Stop for the day once daily PnL ≥ this (keep the win) |
| `flattenBeforeHourET` | Warn: prefer flat/protective actions after this hour |
| `noHoldPastHourET` | Hard: no new trades at/after this hour |
| `manualApprovalRequired` | Account is human-approval-only |
| `automationAllowed` | Whether auto-execution is permitted |
| `allowedProducts` | Exchanges you may trade (e.g. `["CME","NYMEX"]`) |
| `newsLockoutMinutesBefore` / `After` | Block trading around high-impact news |
| `payoutMode.*` | Lock/protect behavior once near or at the payout buffer |

Checks you don't want are made inert by setting the value very high (e.g. Apex has no daily loss limit, so `maxDailyLoss` is set huge).

### Trailing drawdown

Topstep and Apex use a **trailing** max drawdown that follows your peak balance. This engine treats the floor as a fixed `minAccountBalance`. To stay accurate, recompute `minAccountBalance` from your **current** trailing threshold each day (or before each session) and pass the updated policy in. A helper for this is on the roadmap.

## Contribute a pack

1. Copy `take-profit-trader.js` to `your-firm.js`.
2. Fill in the numbers from your firm's **current** rulebook. Comment anything you're unsure about with `// VERIFY`.
3. Add `require("./your-firm")` to the `packs` array in [`index.js`](index.js).
4. Open a PR. One firm per PR keeps review easy.

Keeping these current helps every funded trader on the planet not blow their account on a rule they forgot. That's the seatbelt.
