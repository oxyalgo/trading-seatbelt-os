# Community Setup

A safe, generic layout for a beginner-friendly trading community. Nothing here uses real server, channel, role, or user IDs — set your own.

## Suggested channels

| Channel | Purpose |
| --- | --- |
| `start-here` | Welcome message + how to use the seatbelt bot |
| `rules` | Community rules and expectations |
| `risk-pledge` | Members pledge to risk 1% or less per trade |
| `scam-alerts` | Share suspicious DMs and run them through `/scamcheck` |
| `seatbelt-tools` | Where members use `/risk`, `/check`, and `/review` |
| `classroom` | Beginner lessons and Q&A |
| `community` | General chat |
| `support` | Ask for help with the bot or setup |

## Recommended pinned messages

- **In `start-here`:** a short note that says *"This server has no signals, no guaranteed profits, and no one will DM you to manage your money. Use the bot's `/scamcheck` on anything that promises easy money."*
- **In `risk-pledge`:** the one rule that saves accounts — *"I will always set a stop-loss and risk 1% or less per trade."*
- **In `scam-alerts`:** *"Got a weird DM? Paste it into `/scamcheck` right here before you reply."*

## Wiring the bot in

1. Follow **[SETUP.md](SETUP.md)** to run the bot with your own Discord token.
2. Invite it with the `bot` and `applications.commands` scopes.
3. Give it access to at least `seatbelt-tools` and `scam-alerts`.
4. Encourage members to run `/start` first.

## Moderation tips

- Auto-ban or auto-warn accounts that DM members offering "account management" or "guaranteed" returns.
- Turn on Discord's built-in DM spam and link filters.
- Remind members: **no legit trader or firm needs your login, password, or a crypto transfer.**

## Example (fake IDs only)

If a guide or config needs an ID as an example, use an obviously-fake one and label it:

```
GUILD_ID=000000000000000000   # example only — replace with your own
```

Never paste a real server, channel, role, or user ID into a public repo or screenshot.
