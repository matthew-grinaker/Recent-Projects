# StockChain

StockChain is a multi-interface trading platform built for traders, logistics, investors, suppliers, merchants and customers. It covers the whole deal and trading flow, from RFQ to payment, and connects every touchpoint into one visible story. Built-in intelligence streamlines operations, workflows and deal pipelines, giving insight to every seat at the trading table.

**Client:** In-house product, Grinaker Technologies · **Role:** Technical lead, architect & engineer · **Year:** 2025–2026 · **Status:** Live with first customer

## The problem

A trade deal touches traders, suppliers, merchants, customers, logistics providers, lenders and investors, each with their own systems, documents and spreadsheets. Every hand-off re-keys data, and nobody at the table has one view of a deal from request to payment.

## What I did

- Set the product and technical direction, working directly with traders and merchants to map how a deal actually runs.
- Designed a multi-tenant platform with a dedicated interface for each party, per-tenant data isolation, job queues and ERP sync with reconciliation.
- Built an AI document reader that learns layouts from what users confirm. Every extracted value keeps its source and confidence, and accuracy baselines are checked on every release.
- Delivered most of the build through my own AI agent pipeline, with an independent grader on every ticket and my approval on every merge.

## Outcome

- Live with its first customer 7 months after the project started.
- ~260k lines of backend code across 36 modules, 1,100+ test files and ~2,700 commits.

**Built with:** TypeScript, Node.js/Express, PostgreSQL (row-level security), Redis/Bull, React 19, Docker
