# Setup

This guide gets the Trading Seatbelt running on your machine or server.

## 1. Requirements

- **Node.js 18+** (for the Node path), or
- **Docker** (for the container path).

## 2. Get the code

```bash
git clone https://github.com/your-org/trading-seatbelt-os.git
cd trading-seatbelt-os
```

## 3. Configure

Copy the example env file and fill in the tokens you have.

```bash
cp .env.example .env
```

| Env var | Where to get it |
| --- | --- |
| `DISCORD_TOKEN` | https://discord.com/developers/applications → your app → **Bot** → Reset Token |
| `DISCORD_CLIENT_ID` | Same app → **General Information** → Application ID |
| `TELEGRAM_BOT_TOKEN` | Message **@BotFather** on Telegram → `/newbot` |
| `OWNER_ID` | Optional. Your own account ID for owner-only actions. |

You can set **Discord only**, **Telegram only**, **both**, or **neither**. With neither set, the app prints a friendly message and exits cleanly — it will not crash-loop.

> **Never commit your `.env`.** It's already in `.gitignore`.

## 4. Run with Node

```bash
npm install
npm start                # runs whichever bots have tokens
# or run one platform:
npm run start:discord
npm run start:telegram
```

## 5. Run with Docker

```bash
docker compose up -d
docker compose logs -f seatbelt   # watch the logs
docker compose down               # stop it
```

## 6. Invite the Discord bot

1. In the Developer Portal, go to **OAuth2 → URL Generator**.
2. Scopes: check `bot` and `applications.commands`.
3. Bot permissions: `Send Messages` and `Use Slash Commands` are enough.
4. Open the generated URL and add the bot to your server.

Slash commands register automatically on startup (global commands can take up to an hour to appear the first time).

## 7. Test

```bash
npm test
```

All unit tests should pass.
