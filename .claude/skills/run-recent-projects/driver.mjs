#!/usr/bin/env node
// Preview + smoke driver for the Recent-Projects portfolio repo.
//
//   node driver.mjs serve [port]        serve the repo like GitHub / GitHub Pages (foreground)
//   node driver.mjs shot [urlPath ...]  screenshot pages from a running server (default: / + every project)
//   node driver.mjs check               portfolio lint: READMEs, no code, links, tracked junk
//   node driver.mjs smoke               serve on a free port, check, screenshot everything, exit
//
// Env: PORT (default 4173), SHOTS (default /tmp/shots/recent-projects),
//      MARKED_DIR (default /tmp/run-recent-projects, where `marked` was npm-installed).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const SHOTS = process.env.SHOTS || '/tmp/shots/recent-projects';
const MARKED_DIR = process.env.MARKED_DIR || '/tmp/run-recent-projects';
const CODE_EXT = /\.(js|mjs|cjs|ts|tsx|jsx|py|cs|java|go|rb|php|sql|sh|ps1|vue|svelte|rs|cpp|c|h)$/i;

let marked;
function md(src) {
  if (!marked) {
    try { marked = createRequire(path.join(MARKED_DIR, 'x.js'))('marked').marked; }
    catch { throw new Error(`marked not found under ${MARKED_DIR}. Run: npm install --no-save --no-package-lock --prefix ${MARKED_DIR} marked@15.0.12`); }
  }
  return marked.parse(src, { gfm: true });
}

// Top-level project folders = every non-hidden directory, excluding the skill tooling.
function projects() {
  return fs.readdirSync(ROOT, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('.') && d.name !== 'node_modules')
    .map(d => d.name).sort();
}

const page = (title, body) => `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<style>body{font:16px/1.6 -apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:900px;margin:32px auto;padding:0 16px;color:#1f2328}
a{color:#0969da}pre,code{background:#f6f8fa;border-radius:6px}pre{padding:12px;overflow:auto}code{padding:.1em .3em}
table{border-collapse:collapse}td,th{border:1px solid #d0d7de;padding:4px 10px}h1,h2{border-bottom:1px solid #d0d7de;padding-bottom:.3em}
nav{font-size:14px;margin-bottom:16px}.files li{margin:2px 0}</style></head>
<body><nav><a href="/">Recent-Projects</a></nav>${body}</body></html>`;

function renderDir(rel) {
  const abs = path.join(ROOT, rel);
  const entries = fs.readdirSync(abs, { withFileTypes: true }).filter(e => !e.name.startsWith('.'));
  const list = entries.map(e => {
    const href = '/' + path.posix.join(rel, e.name).split('/').map(encodeURIComponent).join('/') + (e.isDirectory() ? '/' : '');
    return `<li><a href="${href}">${e.name}${e.isDirectory() ? '/' : ''}</a></li>`;
  }).join('');
  const readme = path.join(abs, 'README.md');
  const body = `<ul class="files" data-testid="files">${list}</ul>` +
    (fs.existsSync(readme) ? `<article data-testid="readme">${md(fs.readFileSync(readme, 'utf8'))}</article>` : '');
  return page(rel || 'Recent-Projects', body);
}

const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
  '.pdf': 'application/pdf', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };

function handler(req, res) {
  const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '');
  const abs = path.join(ROOT, rel);
  if (!abs.startsWith(ROOT) || !fs.existsSync(abs)) { res.writeHead(404); return res.end('404 ' + rel); }
  try {
    if (fs.statSync(abs).isDirectory()) {
      // GitHub Pages behaviour: index.html wins (root, or /docs once a dashboard lands there).
      const idx = path.join(abs, 'index.html');
      if (fs.existsSync(idx)) { res.writeHead(200, { 'content-type': 'text/html' }); return res.end(fs.readFileSync(idx)); }
      const html = renderDir(rel.replace(/\/$/, ''));
      res.writeHead(200, { 'content-type': 'text/html' }); return res.end(html);
    }
    if (abs.endsWith('.md')) { const html = page(rel, md(fs.readFileSync(abs, 'utf8'))); res.writeHead(200, { 'content-type': 'text/html' }); return res.end(html); }
    res.writeHead(200, { 'content-type': TYPES[path.extname(abs).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(abs).pipe(res);
  } catch (e) { if (!res.headersSent) res.writeHead(500); res.end(String(e.stack)); }
}

function serve(port) {
  md(''); // fail fast with the install hint instead of 500s on every page
  return new Promise(r => { const s = http.createServer(handler).listen(port, '127.0.0.1', () => r(s)); });
}

async function shot(base, paths) {
  // Global playwright is CJS: require() it (import() of its path nests chromium under .default).
  const { chromium } = createRequire(import.meta.url)('playwright');
  fs.mkdirSync(SHOTS, { recursive: true });
  const browser = await chromium.launch();
  const p = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  const errors = [];
  p.on('pageerror', e => errors.push(e.message));
  let fail = 0;
  for (const u of paths) {
    const file = path.join(SHOTS, (decodeURIComponent(u).replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'home') + '.png');
    if (/\.pdf$/i.test(u)) {
      // Headless Chromium has no PDF viewer (goto throws "Download is starting"): check the
      // HTTP response, then rasterise page 1 of the local file with poppler's pdftoppm.
      const status = (await fetch(base + u)).status;
      let pages = '?';
      try {
        const local = path.join(ROOT, decodeURIComponent(u));
        pages = execFileSync('pdfinfo', [local], { encoding: 'utf8' }).match(/Pages:\s+(\d+)/)?.[1];
        execFileSync('pdftoppm', ['-png', '-r', '80', '-f', '1', '-l', '1', '-singlefile', local, file.slice(0, -4)]);
      } catch (e) { console.log(`     (pdftoppm/pdfinfo unavailable or failed: ${e.message.split('\n')[0]})`); }
      if (status !== 200) fail++;
      console.log(`${status === 200 ? 'OK  ' : 'FAIL'} ${status} ${decodeURIComponent(u)}  pdf pages=${pages}  -> ${file}`);
      continue;
    }
    const resp = await p.goto(base + u, { waitUntil: 'load' });
    const h1 = (await p.locator('h1').first().textContent({ timeout: 2000 }).catch(() => '')) || '';
    await p.screenshot({ path: file, fullPage: false });
    const ok = resp.status() === 200;
    if (!ok) fail++;
    console.log(`${ok ? 'OK  ' : 'FAIL'} ${resp.status()} ${decodeURIComponent(u)}  h1="${h1.trim().slice(0, 60)}"  -> ${file}`);
  }
  await browser.close();
  if (errors.length) { console.log('page errors:', errors); fail++; }
  return fail;
}

function check() {
  const problems = [];
  const warn = [];
  for (const proj of projects()) {
    const files = fs.readdirSync(path.join(ROOT, proj)).filter(f => !f.startsWith('.'));
    if (!files.includes('README.md')) warn.push(`${proj}/ has no README.md (only: ${files.join(', ') || 'nothing'})`);
    for (const f of files) if (CODE_EXT.test(f)) problems.push(`${proj}/${f} is a code file (portfolio is no-code)`);
    if (!files.length) problems.push(`${proj}/ is empty`);
  }
  // Relative links in every README must resolve.
  const readmes = ['README.md', ...projects().map(p => `${p}/README.md`)].filter(f => fs.existsSync(path.join(ROOT, f)));
  for (const f of readmes) {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    for (const [, link] of src.matchAll(/\]\(([^)\s]+)\)/g)) {
      if (/^(https?:|mailto:|#)/.test(link)) continue;
      const target = path.join(ROOT, path.dirname(f), decodeURIComponent(link.split('#')[0]));
      if (!fs.existsSync(target)) problems.push(`${f}: broken link -> ${link}`);
    }
  }
  try {
    const tracked = execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' }).split('\n');
    const junk = tracked.filter(f => /(^|\/)\.DS_Store$|Thumbs\.db$/.test(f));
    if (junk.length) warn.push(`tracked OS junk (in .gitignore but still committed; git rm --cached): ${junk.join(', ')}`);
  } catch { /* not a git checkout */ }
  warn.forEach(w => console.log('WARN ' + w));
  problems.forEach(p => console.log('FAIL ' + p));
  console.log(`check: ${projects().length} projects, ${problems.length} failures, ${warn.length} warnings`);
  return problems.length;
}

const [cmd = 'smoke', ...args] = process.argv.slice(2);
const port = Number(process.env.PORT || 4173);
const enc = rel => '/' + rel.split('/').map(encodeURIComponent).join('/');
const defaultPaths = () => ['/', ...projects().flatMap(p => [enc(p) + '/',
  ...fs.readdirSync(path.join(ROOT, p)).filter(f => /\.pdf$/i.test(f)).map(f => enc(`${p}/${f}`))])];

if (cmd === 'serve') {
  const p = Number(args[0] || port);
  await serve(p);
  console.log(`serving ${ROOT} on http://127.0.0.1:${p}/  (Ctrl-C to stop)`);
} else if (cmd === 'shot') {
  process.exit(await shot(`http://127.0.0.1:${port}`, args.length ? args : defaultPaths()) ? 1 : 0);
} else if (cmd === 'check') {
  process.exit(check() ? 1 : 0);
} else if (cmd === 'smoke') {
  const server = await serve(0);
  const base = `http://127.0.0.1:${server.address().port}`;
  const bad = check() + await shot(base, args.length ? args : defaultPaths());
  server.close();
  console.log(bad ? `smoke: FAILED (${bad})` : 'smoke: PASS');
  process.exit(bad ? 1 : 0);
} else {
  console.error('usage: node driver.mjs serve [port] | shot [path...] | check | smoke [path...]');
  process.exit(2);
}
