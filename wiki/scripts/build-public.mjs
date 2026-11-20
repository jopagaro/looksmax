// Builds the deployable site into dist/: only what the browser needs (index.html, assets/, data/), with cache-busting
// query strings on scripts/styles so visitors always get the latest build. Hosting providers run this as the build
// command (output directory: dist). Run: node scripts/build-public.mjs
import { cpSync, rmSync, mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'dist');
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

let ver = String(Date.now());
try { ver = execSync('git rev-parse --short HEAD', { cwd: root }).toString().trim() || ver; } catch {}

for (const d of ['assets', 'data']) cpSync(join(root, d), join(out, d), { recursive: true });
const html = readFileSync(join(root, 'index.html'), 'utf8')
  .replace(/(src|href)="(assets\/[^"?]+\.(?:js|css))"/g, (_, a, p) => `${a}="${p}?v=${ver}"`);
writeFileSync(join(out, 'index.html'), html);

// The app fetches data/entries/<slug>.json; tag those fetches with the build version too.
const appPath = join(out, 'assets', 'app.js');
writeFileSync(appPath, readFileSync(appPath, 'utf8').replace('fetch(`data/entries/${s}.json`', 'fetch(`data/entries/${s}.json?v=' + ver + '`'));

// Long cache for versioned files, short for the page itself (Cloudflare Pages / Netlify read _headers).
writeFileSync(join(out, '_headers'), [
  '/index.html', '  Cache-Control: public, max-age=300',
  '/', '  Cache-Control: public, max-age=300',
  '/assets/*', '  Cache-Control: public, max-age=31536000, immutable',
  '/data/*', '  Cache-Control: public, max-age=31536000, immutable',
  '',
].join('\n'));
writeFileSync(join(out, 'robots.txt'), 'User-agent: *\nAllow: /\n');
if (existsSync(join(root, 'CNAME'))) cpSync(join(root, 'CNAME'), join(out, 'CNAME'));

const count = execSync(`find "${out}" -type f | wc -l`).toString().trim();
const size = execSync(`du -sh "${out}" | cut -f1`).toString().trim();
console.log(`dist/ ready: ${count} files, ${size}, version ${ver}`);
