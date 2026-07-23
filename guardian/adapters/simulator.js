"use strict";

/**
 * Simulator adapter — for testing the Guardian without a live account.
 * Plays a scripted sequence of account states (each read() advances one step,
 * then holds on the last). Lets us prove the alert logic end-to-end.
 */

function makeSimulatorReader(steps) {
  let i = 0;
  return async function read() {
    const s = steps[Math.min(i, steps.length - 1)];
    i++;
    return { balance: s.balance, equity: s.equity, openPL: s.openPL ?? 0 };
  };
}

module.exports = { makeSimulatorReader };
