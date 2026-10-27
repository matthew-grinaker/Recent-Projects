# GTech OS

A multi-agent platform where AI agents plan, build and review work, and plain code enforces the rules.

**Client:** In-house platform · **Role:** Architect & builder · **Year:** 2026 · **Status:** In progress

## The problem

Letting AI agents do real work needs hard limits: budgets, approvals and protection against runaway loops or malicious input. Leaving those decisions to the model isn't safe enough for business use.

## What I did

- Designed a conductor agent that plans work and hands it to researcher, coder, reviewer and tester agents.
- Built hard caps on budget, depth and concurrency, plus human approval gates and recovery after restarts.
- Added loop detection, prompt-injection scanning on everything agents read, and full replay of every run.

## Outcome

- On its first live run, three agents planned, built and reviewed a task in two attempts.

**Built with:** TypeScript, Claude Agent SDK, JSONL event bus
