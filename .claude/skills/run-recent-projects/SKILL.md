---
name: run-recent-projects
description: Run, preview, check and screenshot the Recent-Projects portfolio. Use when asked to start or serve the portfolio, preview a project write-up or the GitHub Pages dashboard, screenshot pages or PDFs, lint the repo (missing READMEs, code files, broken links), or confirm a content change renders.
---

Recent-Projects is a **no-code portfolio**: one folder per project holding a
`README.md` write-up and/or a PDF. There is no build. "Running" it means
serving the repo the way GitHub (and later GitHub Pages) shows it, then
driving headless Chromium against it. Everything goes through one driver:
`.claude/skills/run-recent-projects/driver.mjs`.

All paths are relative to the repo root.

## Prerequisites

Node 22, the pre-installed global Playwright + Chromium, and poppler
(`pdftoppm`, `pdfinfo`) were already present in the container. The only
install is the Markdown renderer, kept outside the repo so no `package.json`
lands in a no-code portfolio:

```bash
npm install --no-save --no-package-lock --prefix /tmp/run-recent-projects marked@15.0.12
```

## Run (agent path)

One-shot smoke: serves on a random port, runs the lint, screenshots the home
page, every project page and page 1 of every PDF, then exits 0/1.

```bash
node .claude/skills/run-recent-projects/driver.mjs smoke
```

Screenshots land in `/tmp/shots/recent-projects/` (`home.png`, `DMS.png`,
`Giffy_Giffy_GOAT_Portfolio_pdf.png`, ...). Read them; a page with only a
file list and no article means the folder has no README.

For iterating on one page, keep a server up and shoot specific paths
(URL-encode spaces):

```bash
(node .claude/skills/run-recent-projects/driver.mjs serve 4173 > /tmp/recent-projects.log 2>&1 &)
timeout 15 bash -c 'until curl -sf http://127.0.0.1:4173/ >/dev/null; do sleep 0.3; done'
node .claude/skills/run-recent-projects/driver.mjs shot /DMS/ "/Giffy/Giffy%20GOAT%20-%20Portfolio.pdf"
lsof -ti:4173 -sTCP:LISTEN | xargs -r kill
```

| command | what it does |
|---|---|
| `smoke [path...]` | check + serve on a free port + screenshot (default: `/`, every project, every PDF) |
| `serve [port]` | foreground server, default 4173. Folder -> file list + rendered README; `.md` -> HTML; `index.html` in a folder wins, like Pages |
| `shot [path...]` | screenshot paths against `PORT` (default 4173); `.pdf` paths are rasterised with `pdftoppm` |
| `check` | lint: code files in project folders and broken relative README links fail; missing README and tracked `.DS_Store` warn |

A click-through flow (home -> project) with Playwright directly, against a
running `serve`:

```bash
node -e "
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage();
await p.goto('http://127.0.0.1:4173/');await p.click('text=EventVault/');await p.waitForSelector('[data-testid=readme] h1');
console.log(p.url(),'|',await p.textContent('h1'));await p.screenshot({path:'/tmp/shots/recent-projects/clickthrough.png'});await b.close()})()"
```

Stable hooks: `[data-testid=files]` (folder listing), `[data-testid=readme]`
(rendered README).

## Run (human path)

Open the repo on GitHub; it renders the same READMEs. Locally,
`node .claude/skills/run-recent-projects/driver.mjs serve` then browse
http://127.0.0.1:4173/ and Ctrl-C to stop.

## Test

There is no test suite. `check` is the test:

```bash
node .claude/skills/run-recent-projects/driver.mjs check
```

Current state: 7 projects, 0 failures, 3 warnings (Giffy and Gym have only a
PDF, no README; five `.DS_Store` files are committed despite `.gitignore`).

## Gotchas

- **Folder names have spaces and a typo** (`Automous Trading Bot/`). Shoot
  them URL-encoded (`/Automous%20Trading%20Bot/`); screenshot filenames
  replace non-alphanumerics with `_`. Don't "fix" the typo in a path
  without updating every link to it.
- **Headless Chromium can't open PDFs.** `page.goto()` on a PDF throws
  `Download is starting`. The driver checks the HTTP status and renders
  page 1 with `pdftoppm` instead; read the PNG.
- **The `.claude/` folder is hidden from the portfolio listing and from
  `check`** (dot-dirs are skipped), so this skill never shows up as a
  "project".
- **GitHub Pages dashboard:** when an `index.html` lands at the root (or in
  a folder), `serve` returns it instead of the README view, matching Pages.
  `smoke /` then screenshots the dashboard. If it lives in `/docs`, shoot
  `/docs/`.
- **`check` flags any code file** (`.py`, `.js`, `.sql`, ...) inside a
  project folder, because the portfolio rule is "no code added". A
  dashboard's own `index.html`/CSS/JS at root or in `docs/` is not in a
  project folder and is not flagged.

## Troubleshooting

- **`TypeError: Cannot read properties of undefined (reading 'launch')`**:
  the global Playwright is CommonJS; `await import(<resolved path>)` nests
  `chromium` under `.default`. The driver uses `createRequire(...)('playwright')`.
- **`marked not found under /tmp/run-recent-projects`**: the container was
  recycled; rerun the `npm install --prefix` line in Prerequisites.
- **`EADDRINUSE` on serve**: an old server is still up;
  `lsof -ti:4173 -sTCP:LISTEN | xargs -r kill`.
