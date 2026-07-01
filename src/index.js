'use strict';

/**
 * Launcher — starts whichever bots you have configured.
 *
 * - Set DISCORD_TOKEN to run the Discord bot.
 * - Set TELEGRAM_BOT_TOKEN to run the Telegram bot.
 * - Set both to run both. Set neither and this exits cleanly with instructions.
 *
 * Each bot also no-ops gracefully on its own if its token is missing, so running
 * this without any config never crash-loops (handy inside Docker).
 */

require('dotenv').config();

const hasDiscord = process.env.DISCORD_TOKEN && process.env.DISCORD_TOKEN !== 'your-discord-bot-token-here';
const hasTelegram =
  process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_TOKEN !== 'your-telegram-bot-token-here';

if (!hasDiscord && !hasTelegram) {
  console.log('[seatbelt] No bot tokens set.');
  console.log('[seatbelt] Copy .env.example to .env and add DISCORD_TOKEN and/or TELEGRAM_BOT_TOKEN.');
  console.log('[seatbelt] Exiting cleanly.');
  process.exit(0);
}

if (hasDiscord) {
  console.log('[seatbelt] Starting Discord bot...');
  require('./discord/bot');
}

if (hasTelegram) {
  console.log('[seatbelt] Starting Telegram bot...');
  require('./telegram/bot');
}
