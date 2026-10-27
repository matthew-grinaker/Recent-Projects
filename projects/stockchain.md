# StockChain

A data platform for import merchants that runs one deal flow, from RFQ to payment, across the merchant, their customer and their lender.

**Client:** In-house product, Grinaker Technologies · **Role:** Technical lead, architect & engineer · **Year:** 2025–2026 · **Status:** Live with first customer

## The problem

Import merchants juggle quotes, shipping documents, ERP records, freight agents, FX brokers and lenders across email and spreadsheets. Every hand-off re-keys data, and nobody has one view of a deal from request to payment.

## What I did

- Set the product and technical direction, working directly with merchants to map how a deal actually runs.
- Designed a multi-tenant platform with per-tenant data isolation, job queues and ERP sync with reconciliation.
- Built an AI document reader that learns layouts from what users confirm. Every extracted value keeps its source and confidence, and accuracy baselines are checked on every release.
- Delivered most of the build through my own AI agent pipeline, with an independent grader on every ticket and my approval on every merge.

## Outcome

- Live with its first customer 7 months after the project started.
- ~260k lines of backend code across 36 modules, 1,100+ test files and ~2,700 commits.

**Built with:** TypeScript, Node.js/Express, PostgreSQL (row-level security), Redis/Bull, React 19, Docker
