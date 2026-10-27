# Claude Fleet

A control room for AI coding agents: one page to see and steer every agent session, on my machine and in the cloud.

**Client:** In-house tool · **Role:** Designer & builder · **Year:** 2026 · **Status:** In daily use

## The problem

Running many AI agent sessions in parallel means losing track of what each one is doing, and work stalls whenever an agent needs an answer while I'm away from my desk.

## What I did

- Built a live view of every session's task list, including nested sub-agents.
- Made it possible to message any session directly, and to answer agents from Slack when away.
- Required approval for every write, and built self-update with rollback.

## Outcome

- Lets one person supervise a fleet of agents safely, without being tied to a desk.

**Built with:** Node.js, Electron, Slack Bolt, Claude Code hooks
