// Minimal static server for dist/ that mirrors the Vercel settings this site relies on:
// clean URLs (/vista serves vista.html) and the redirects in vercel.json. For local checks only.
import {createServer} from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import {join, normalize, extname} from 'node:path';

const root = join(process.cwd(), 'dist'), port = Number(process.env.PORT || 8765);
const types = {'.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.wasm': 'application/wasm', '.pdf': 'application/pdf', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'};
const {redirects = []} = JSON.parse(await readFile('vercel.json', 'utf8'));
const isFile = async p => { try { return (await stat(p)).isFile(); } catch { return false; } };

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const path = decodeURIComponent(url.pathname);
  const hop = redirects.find(r => r.source === path);
  if (hop) { res.writeHead(hop.permanent ? 308 : 307, {Location: hop.destination + url.search}); return res.end(); }
  const safe = normalize(path).replace(/^(\.\.[/\\])+/, '');
  let file = join(root, safe);
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  if (path.endsWith('/') || await isFile(join(file, 'index.html'))) file = join(file, 'index.html');
  else if (!(await isFile(file)) && await isFile(file + '.html')) file += '.html';
  if (!(await isFile(file))) { res.writeHead(404, {'Content-Type': types['.html']}); return res.end(await readFile(join(root, '404.html')).catch(() => 'Not found')); }
  res.writeHead(200, {'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store'});
  res.end(await readFile(file));
}).listen(port, '127.0.0.1', () => console.log(`VISTA dist on http://127.0.0.1:${port}`));
