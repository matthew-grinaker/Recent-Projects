# Shared Second Brain

One shared source of business context, rules and tooling for a team's AI agents, so every agent session starts from the same picture.

**Client:** In-house, used by the StockChain team · **Role:** Designer & builder · **Year:** 2026 · **Status:** In use since October 2026

## The problem

Two AI agents working on the same product undid each other's settled decisions. Each session started from a different, partial view of the business, and nothing stopped an agent from changing an area someone else was working on.

## What I did

- Built a decision log with supersession, so settled decisions stay settled and every change is traceable.
- Added handovers and time-limited work claims: an agent must claim an area before it can change it.
- Centralised the team's shared agents, skills, hooks and tools in one place.
- Recorded an owner, source and last-verified date on every record.

## Outcome

- In daily use by the StockChain team; the design passed independent grading before rollout.

**Built with:** Node.js CLI (no dependencies), GitHub Issues and git as the store, Claude Code hooks
