# i-Con Web Monitor

A real-time web dashboard that monitors and manages a fleet of legacy integration servers.

**Client:** An enterprise running critical i-Con integration infrastructure · **Role:** Architect & lead developer · **Year:** 2025 · **Status:** Live

## The problem

The operations team spent 40+ hours a week manually checking interface status across dozens of 20-year-old integration servers. Failures were found only after downstream systems broke.

## What I did

- Built a client for the servers' custom TCP protocol so legacy systems could be monitored without changing them.
- Designed a live dashboard with real-time push updates, alerts and central control of 100+ servers.
- Built for scale: 10,000+ messages a minute with sub-100 ms API responses.

## Outcome

- Time to spot a failed server dropped from 30+ minutes to under 2.
- 80% less manual monitoring (40 to 8 hours a week) and 99.9% availability.
- R50K+ in annual operating cost savings.

**Built with:** C#, .NET 8, ASP.NET Core, SignalR, React, Redis
