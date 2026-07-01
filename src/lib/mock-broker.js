'use strict';

/**
 * MockBroker — a fake, in-memory broker so anyone can try the bot with ZERO real
 * credentials and ZERO real money. Nothing here touches a real exchange or API.
 *
 * Positions get a tiny random-walk price so the demo "moves" and P&L changes,
 * letting the seatbelt tools react to open trades. It is intentionally simple.
 */

let nextId = 1;

class MockBroker {
  constructor(opts = {}) {
    this.balance = typeof opts.startBalance === 'number' ? opts.startBalance : 10000;
    this.positions = new Map(); // id -> position
  }

  /**
   * Open a demo position.
   * @param {object} order
   * @param {string} order.symbol
   * @param {'BUY'|'SELL'} order.side
   * @param {number} order.size    - units/lots
   * @param {number} order.price   - entry price
   * @returns {object} the created position
   */
  open({ symbol, side, size, price }) {
    if (!symbol || typeof symbol !== 'string') throw new Error('symbol is required');
    const dir = String(side).toUpperCase() === 'SELL' ? 'SELL' : 'BUY';
    if (!(size > 0)) throw new Error('size must be greater than 0');
    if (!(price > 0)) throw new Error('price must be greater than 0');

    const position = {
      id: nextId++,
      symbol: symbol.toUpperCase(),
      side: dir,
      size,
      entry: price,
      price, // current price, updated by tick()
      pnl: 0,
      openedAt: Date.now(),
    };
    this.positions.set(position.id, position);
    return { ...position };
  }

  /**
   * Nudge every open position's price by a small random walk and recompute P&L.
   * Purely cosmetic — makes the demo feel alive.
   */
  tick() {
    for (const pos of this.positions.values()) {
      const drift = (Math.random() - 0.5) * pos.entry * 0.002; // +/-0.2%
      pos.price = round(pos.price + drift, 5);
      const move = pos.price - pos.entry;
      const direction = pos.side === 'BUY' ? 1 : -1;
      pos.pnl = round(move * direction * pos.size, 2);
    }
    return this.listPositions();
  }

  /**
   * Close a demo position and bank its P&L into the balance.
   * @param {number} id
   * @returns {object} the closed position with final pnl
   */
  close(id) {
    const pos = this.positions.get(id);
    if (!pos) throw new Error(`No open position with id ${id}`);
    this.balance = round(this.balance + pos.pnl, 2);
    this.positions.delete(id);
    return { ...pos, closed: true };
  }

  /** @returns {object[]} snapshot of all open positions */
  listPositions() {
    return [...this.positions.values()].map((p) => ({ ...p }));
  }

  /** @returns {number} current demo balance */
  getBalance() {
    return this.balance;
  }
}

function round(value, decimals) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

module.exports = { MockBroker };
