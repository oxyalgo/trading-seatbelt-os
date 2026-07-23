"use strict";

/**
 * TradeLocker adapter — read-only. Logs in and reads live account state.
 * It NEVER places, modifies, or closes an order. Node 18+ (global fetch).
 *
 * Works with any TradeLocker broker (Genesis, and others) — set the `server`.
 */

const TL_BASE = "https://live.tradelocker.com/backend-api";

async function tlLogin(email, password, server) {
  const res = await fetch(`${TL_BASE}/auth/jwt/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, server }),
  });
  if (!res.ok) throw new Error(`TradeLocker login failed (${res.status})`);
  const d = await res.json();
  return { accessToken: d.accessToken, refreshToken: d.refreshToken };
}

async function tlGetAccounts(token) {
  const res = await fetch(`${TL_BASE}/auth/jwt/all-accounts`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`TradeLocker accounts failed (${res.status})`);
  const d = await res.json();
  return d.accounts || [];
}

// Returns { balance, equity, openPL } for one account.
async function tlGetAccountStatus(token, accNum, accountId) {
  const res = await fetch(`${TL_BASE}/trade/accounts/${accountId}/state`, {
    headers: { Authorization: `Bearer ${token}`, accNum: String(accNum), "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`TradeLocker state failed (${res.status})`);
  const j = await res.json();
  const dd = (j.d && j.d.accountDetailsData) || [];
  // v2 index map: [0]=balance, [1]=equity, [3]=openPL
  return { balance: dd[0] ?? 0, equity: dd[1] ?? 0, openPL: dd[3] ?? 0 };
}

/**
 * Build a live-state reader for one enrolled account.
 * `acct` = { email, password, server, accNum, accountId }.
 * If accNum/accountId are omitted, uses the first account on the login.
 * Returns an async function () => { balance, equity, openPL }.
 */
function makeTradeLockerReader(acct) {
  let token = null;
  let accNum = acct.accNum;
  let accountId = acct.accountId;

  async function ensureAuth() {
    if (token) return;
    const auth = await tlLogin(acct.email, acct.password, acct.server);
    token = auth.accessToken;
    if (accNum == null || accountId == null) {
      const accounts = await tlGetAccounts(token);
      const a = accounts[0];
      if (!a) throw new Error("No TradeLocker accounts on this login");
      accNum = a.accNum;
      accountId = a.accountId;
    }
  }

  return async function read() {
    try {
      await ensureAuth();
      return await tlGetAccountStatus(token, accNum, accountId);
    } catch (e) {
      // token likely expired — force a fresh login next tick
      token = null;
      throw e;
    }
  };
}

module.exports = { tlLogin, tlGetAccounts, tlGetAccountStatus, makeTradeLockerReader };
