# Contributing

Thanks for helping make trading safer for beginners. 🦺

## Ground rules

- **Never commit secrets.** No real tokens, keys, or IDs — ever. Use fake placeholders (see `.env.example`).
- **Keep it beginner-friendly.** User-facing text should read at a 5th–8th grade level. Short, calm, clear.
- **Safety only.** This repo is the seatbelt. Do **not** add live signals, trade execution, or strategy code here.
- **Keep the core pure.** Logic in `src/lib/` should stay pure and testable (no network, no I/O).

## How to contribute

1. Fork the repo and create a branch: `git checkout -b my-feature`.
2. Make your change. Add or update tests in `tests/`.
3. Run `npm test` and make sure everything passes.
4. Open a pull request with a clear description of what and why.

## Good first issues

- Add a new scam red-flag pattern (with a test).
- Improve the wording of a user-facing message.
- Add a new pre-trade checklist item.
- Translate user-facing strings.

## Code style

- Node 18+, CommonJS, no build step.
- Small, focused functions. Comment the "why", not the obvious "what".

By contributing, you agree your work is licensed under the [MIT License](LICENSE).
