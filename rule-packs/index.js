"use strict";

/**
 * Rule-pack registry.
 *
 * Loads every prop-firm pack in this folder and exposes them by policy id.
 * To add a firm: drop a `your-firm.js` file here that exports a map of
 * { POLICY_ID: policyObject }, then require it below. That's it — one PR per firm.
 */

const packs = [
  require("./take-profit-trader"),
  require("./topstep"),
  require("./apex")
];

const REGISTRY = Object.assign({}, ...packs);

function getPolicy(id) {
  const policy = REGISTRY[id];
  if (!policy) {
    throw new Error(`Unknown policy: ${id}. Known: ${Object.keys(REGISTRY).join(", ")}`);
  }
  return policy;
}

function listPolicies() {
  return Object.values(REGISTRY).map((p) => ({ id: p.id, firm: p.firm, accountSize: p.accountSize }));
}

module.exports = { REGISTRY, getPolicy, listPolicies };
