'use strict';

require('dotenv').config();

const { Bot } = require('grammy');
const { start } = require('./commands/start');
const { scamcheck } = require('./commands/scamcheck');
const { risk } = require('./commands/risk');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Friendly no-op so `docker run` without config doesn't crash-loop.
if (!TOKEN || TOKEN === 'your-telegram-bot-token-here') {
  console.log('[seatbelt/telegram] No TELEGRAM_BOT_TOKEN set. Copy .env.example to .env and add your token.');
  console.log('[seatbelt/telegram] Nothing to run yet — exiting cleanly.');
  process.exit(0);
}

const bot = new Bot(TOKEN);

bot.command('start', start);
bot.command('scamcheck', scamcheck);
bot.command('risk', risk);

// Any other text: point the user at the tools.
bot.on('message:text', async (ctx) => {
  if (ctx.message.text.startsWith('/')) return; // unknown command
  await ctx.reply('Try /start to see what I can do, or /scamcheck to check an offer.');
});

bot.catch((err) => {
  console.error('[seatbelt/telegram] Error:', err.message);
});

bot.start({
  onStart: (info) => console.log(`[seatbelt/telegram] Logged in as @${info.username}`),
});
