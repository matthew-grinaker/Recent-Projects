---
name: portfolio-refresh
description: Refresh the portfolio (Now tab, projects, CV) from UPDATES.md, a new CV in cv/inbox/, and messages in the run prompt. Opens one PR only when something changed.
---

# Portfolio refresh

This repo is a no-code portfolio for clients, recruiters, prospects and partners. Never add source code from client projects. Never add long technical documents.

## Where things live

- `data/portfolio.json`: drives the dashboard (`index.html`). It holds `updated` (YYYY-MM-DD), `profile`, `stats`, `now` (current work), `projects` (cards, newest first), `experience`, `education` and `skills`.
- `projects/<slug>.md`: one short write-up per project, following `projects/_TEMPLATE.md` (about half a page).
- `README.md`: mirrors "Currently working on" and the "Selected work" table. Keep it in sync with the JSON.
- `cv/Matthew-Grinaker-CV.pdf`: the published CV.
- Change sources: the `## Pending` list in `UPDATES.md`, any PDF in `cv/inbox/`, and any updates given in the prompt that started this run.

## Steps

1. Collect the changes from all three sources. If there are none, stop: make no branch, commit or PR, and report "No portfolio changes this week."
2. **New CV (a PDF in `cv/inbox/`):** extract the text with `pdftotext -layout`. Replace `cv/Matthew-Grinaker-CV.pdf` with it and delete the inbox copy. Update `profile`, `stats`, `experience`, `education` and `skills` in the JSON. Compare the CV's "Recent Projects" section with `now` and `projects`: add new projects (a write-up, a card and a README row), and update the status, outcome and stack of existing ones.
3. **Each update line:**
   - A status change (e.g. "X is live"): update the card's `status` and `highlight`, the write-up's status line and outcome, and the README row. Move a shipped item out of `now` into `projects`.
   - A new project: write `projects/<kebab-slug>.md` from the template, add a card to the top of `projects`, add a README row and, if it's in progress, add a `now` entry.
   - A finished or dropped current item: remove it from `now` and from the README "Currently working on" list.
4. **Writing rules:** use plain business language for a non-technical reader, and lead with outcomes. Never invent metrics, clients, dates or roles. If a fact is missing, leave it out. Name a client only if Matt named it; otherwise describe it, e.g. "A South African property group". Keep `now` to at most 4 items.
5. Set `updated` to today's date and update the "_Updated …_" line in the README. Empty the `## Pending` list in `UPDATES.md`, keeping the heading.
6. Validate: run `python3 -m json.tool data/portfolio.json`. Every `slug` in `now` and `projects` must have a matching `projects/<slug>.md`, and every README link must resolve.
7. Branch `portfolio-refresh/<YYYY-MM-DD>` from `main`, commit, push, and open one PR titled "Portfolio refresh <date>" that lists each change. Assign it to `matthew-grinaker`.
