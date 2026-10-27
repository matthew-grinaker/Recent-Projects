# Autonomous Trading Bot

An automated trading system that turns TradingView strategy alerts into live broker orders, with position tracking and risk controls.

**Client:** Private trading client · **Role:** Designer & developer · **Year:** 2025 · **Status:** Live

## The problem

Executing trading strategies by hand is slow, inconsistent and impossible to sustain around the clock. Managing several strategies at once, each with its own positions and stops, multiplies the risk of mistakes.

## What I did

- Built a service that receives strategy alerts and places orders through a pluggable broker layer.
- Added position and P&L tracking across multiple strategies, plus automatic stop-loss and take-profit monitoring.
- Added real-time Telegram notifications for every trade and system event.
- Validated it over 30+ days of paper trading before going live.

## Outcome

- 99.9% uptime over 6 months, with signal-to-order latency under 2 seconds.
- Runs 10+ strategies at once and replaced 40+ hours a week of manual monitoring.

**Built with:** Python, FastAPI, PostgreSQL, Docker, Telegram API
