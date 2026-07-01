'use strict';

const test = require('node:test');
const assert = require('node:assert');

const {
  checkOffer,
  positionSize,
  revengeGuard,
  checklist,
} = require('../src/lib/seatbelt');
const { MockBroker } = require('../src/lib/mock-broker');

// -----------------------------------------------------------------------------
// checkOffer
// -----------------------------------------------------------------------------

test('checkOffer flags an obvious scam pitch as HIGH RISK', () => {
  const text = 'Guaranteed risk-free profits! Double your money, DM now, send crypto to my wallet today.';
  const result = checkOffer(text);
  assert.ok(result.score >= 6, `expected high score, got ${result.score}`);
  assert.strictEqual(result.level, 'HIGH RISK');
  assert.ok(result.hits.length >= 3);
});

test('checkOffer treats clean, honest text as LOWER RISK', () => {
  const text = 'I journal every trade and only risk one percent. No promises, trading is hard.';
  const result = checkOffer(text);
  assert.strictEqual(result.level, 'LOWER RISK');
  assert.strictEqual(result.hits.length, 0);
});

test('checkOffer returns CAUTION in the middle band', () => {
  // Three red flags -> score 3 + 2 bonus = 5 -> CAUTION band.
  const text = 'Limited spots, act now for my premium signal group. This is a secret strategy from an insider. 10x your money.';
  const result = checkOffer(text);
  assert.strictEqual(result.level, 'CAUTION');
  assert.ok(result.score >= 3 && result.score < 6);
});

test('checkOffer caps score at 10', () => {
  const text =
    'Guaranteed no loss, prop challenge pass, double your money 100x, send usdt to my wallet now, ' +
    'give me your login and anydesk, last chance today only, copy my trades secret strategy, ' +
    'loss recovery martingale double down, withdrawal proof lifestyle lamborghini.';
  const result = checkOffer(text);
  assert.ok(result.score <= 10);
});

// -----------------------------------------------------------------------------
// positionSize
// -----------------------------------------------------------------------------

test('positionSize computes risk amount and units correctly', () => {
  const r = positionSize({ accountBalance: 10000, riskPercent: 1, entry: 100, stop: 95, pipValue: 1 });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.riskAmount, 100); // 1% of 10000
  assert.strictEqual(r.stopDistance, 5); // |100 - 95|
  assert.strictEqual(r.units, 20); // 100 / (5 * 1)
});

test('positionSize rejects a zero-width stop', () => {
  const r = positionSize({ accountBalance: 10000, riskPercent: 1, entry: 100, stop: 100 });
  assert.strictEqual(r.ok, false);
  assert.match(r.error, /same price/i);
});

test('positionSize rejects bad inputs', () => {
  assert.strictEqual(positionSize({ accountBalance: -1, riskPercent: 1, entry: 100, stop: 95 }).ok, false);
  assert.strictEqual(positionSize({ accountBalance: 10000, riskPercent: 0, entry: 100, stop: 95 }).ok, false);
  assert.strictEqual(positionSize({ accountBalance: 10000, riskPercent: 200, entry: 100, stop: 95 }).ok, false);
  assert.strictEqual(positionSize({ accountBalance: 10000, riskPercent: 1, entry: 'x', stop: 95 }).ok, false);
});

test('positionSize warns when risk percent is aggressive', () => {
  const r = positionSize({ accountBalance: 10000, riskPercent: 6, entry: 100, stop: 95, pipValue: 1 });
  assert.strictEqual(r.ok, true);
  assert.match(r.note, /blow an account/i);
});

// -----------------------------------------------------------------------------
// revengeGuard
// -----------------------------------------------------------------------------

test('revengeGuard applies no cooldown after one loss', () => {
  const r = revengeGuard(1);
  assert.strictEqual(r.cooldown, false);
  assert.strictEqual(r.minutes, 0);
});

test('revengeGuard escalates cooldown with losing streak', () => {
  assert.strictEqual(revengeGuard(2).minutes, 30);
  assert.strictEqual(revengeGuard(3).minutes, 120);
  assert.strictEqual(revengeGuard(4).cooldown, true);
  assert.strictEqual(revengeGuard(9).minutes, 1440);
});

// -----------------------------------------------------------------------------
// checklist
// -----------------------------------------------------------------------------

test('checklist returns a non-empty list of strings', () => {
  const items = checklist();
  assert.ok(Array.isArray(items));
  assert.ok(items.length >= 5);
  assert.ok(items.every((i) => typeof i === 'string' && i.length > 0));
});

// -----------------------------------------------------------------------------
// MockBroker
// -----------------------------------------------------------------------------

test('MockBroker opens, ticks, and closes a position', () => {
  const broker = new MockBroker({ startBalance: 5000 });
  const pos = broker.open({ symbol: 'eurusd', side: 'buy', size: 10, price: 1.1 });
  assert.strictEqual(pos.symbol, 'EURUSD');
  assert.strictEqual(pos.side, 'BUY');
  assert.strictEqual(broker.listPositions().length, 1);

  broker.tick();
  const closed = broker.close(pos.id);
  assert.strictEqual(closed.closed, true);
  assert.strictEqual(broker.listPositions().length, 0);
  assert.strictEqual(typeof broker.getBalance(), 'number');
});
