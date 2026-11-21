// Local stand-in for Cloudflare's static-asset serving, for testing dist/ before deploying:
//   exact file → served; /path → /path.html if it exists; anything else → /index.html (single-page app fallback).
// Run: node scripts/serve-dist.mjs [port]   (default 4175)
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const port = Number(process.argv[2] || 4175);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.xml': 'application/xml',
  '.txt': 'text/plain', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.gif': 'image/gif' };
const isFile = async (p) => { try { return (await stat(p)).isFile(); } catch { return false; } };

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = join(dist, path);
  if (!file.startsWith(dist)) { res.writeHead(403); return res.end(); }
  if (path === '/' || !(await isFile(file))) {
    const html = join(dist, path.replace(/\/+$/, '') + '.html');
    file = path !== '/' && (await isFile(html)) ? html : join(dist, 'index.html');
  }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
  res.end(await readFile(file));
}).listen(port, () => console.log(`dist/ on http://localhost:${port}`));
