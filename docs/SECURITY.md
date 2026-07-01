# Security Policy

## Reporting a vulnerability

If you find a security issue, please **do not open a public issue.** Instead:

1. Open a [private security advisory](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability) on this repo, **or**
2. Email the maintainers (see the repo's profile/README for a current contact).

Please include steps to reproduce and the impact. We aim to acknowledge reports within a few days.

## This repo must never contain secrets

This is a **public, open-core** project. It must never contain:

- Real API tokens, bot tokens, API keys, or passwords.
- Real Discord server, channel, role, or user IDs.
- Broker endpoints, server IP addresses, or internal hostnames.

Everything sensitive lives in a local `.env` (git-ignored). The committed `.env.example` uses fake placeholders only.

## For maintainers

Please keep these GitHub protections **enabled** on this repo:

- **Secret scanning** — flags committed credentials.
- **Push protection** — blocks pushes that contain detected secrets.
- **Dependabot alerts** — flags vulnerable dependencies.

If a secret is ever committed by accident, treat it as compromised: rotate it immediately, then remove it from history. Rotating the secret matters more than scrubbing history.
