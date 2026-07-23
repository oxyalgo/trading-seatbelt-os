"use strict";

// Minimal Telegram sender. The trader's bot token + their chat id.
async function sendAlert(botToken, chatId, text) {
  if (!botToken || !chatId) return { ok: false, error: "no telegram config" };
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    });
    const j = await res.json().catch(() => ({}));
    return { ok: !!j.ok, error: j.description };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

module.exports = { sendAlert };
