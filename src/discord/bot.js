'use strict';

require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const {
  Client,
  GatewayIntentBits,
  Collection,
  REST,
  Routes,
  Events,
} = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;

// Friendly no-op so `docker run` without config doesn't crash-loop.
if (!TOKEN || TOKEN === 'your-discord-bot-token-here') {
  console.log('[seatbelt/discord] No DISCORD_TOKEN set. Copy .env.example to .env and add your token.');
  console.log('[seatbelt/discord] Nothing to run yet — exiting cleanly.');
  process.exit(0);
}

// Load every command file in ./commands
function loadCommands() {
  const commands = new Collection();
  const dir = path.join(__dirname, 'commands');
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.js'))) {
    const cmd = require(path.join(dir, file));
    if (cmd?.data?.name && typeof cmd.execute === 'function') {
      commands.set(cmd.data.name, cmd);
    } else {
      console.warn(`[seatbelt/discord] Skipping ${file} — missing data or execute.`);
    }
  }
  return commands;
}

const commands = loadCommands();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, async (c) => {
  console.log(`[seatbelt/discord] Logged in as ${c.user.tag}`);

  // Register slash commands globally (may take up to an hour to appear).
  if (CLIENT_ID && CLIENT_ID !== 'your-discord-client-id-here') {
    try {
      const rest = new REST({ version: '10' }).setToken(TOKEN);
      const body = [...commands.values()].map((cmd) => cmd.data.toJSON());
      await rest.put(Routes.applicationCommands(CLIENT_ID), { body });
      console.log(`[seatbelt/discord] Registered ${body.length} slash commands.`);
    } catch (err) {
      console.error('[seatbelt/discord] Failed to register commands:', err.message);
    }
  } else {
    console.log('[seatbelt/discord] DISCORD_CLIENT_ID not set — skipping command registration.');
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const cmd = commands.get(interaction.commandName);
  if (!cmd) return;
  try {
    await cmd.execute(interaction);
  } catch (err) {
    console.error(`[seatbelt/discord] Error in /${interaction.commandName}:`, err.message);
    const reply = { content: 'Something went wrong. Please try again.', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply).catch(() => {});
    } else {
      await interaction.reply(reply).catch(() => {});
    }
  }
});

client.login(TOKEN).catch((err) => {
  console.error('[seatbelt/discord] Login failed:', err.message);
  process.exit(1);
});
