const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const projectRoot = path.resolve(__dirname, '..');
// Only public assets are served; repository and configuration files stay private.
const assets = new Map([
  ['/', ['public/index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['public/index.html', 'text/html; charset=utf-8']],
  ['/workspace.js', ['src/features/workspace.js', 'text/javascript; charset=utf-8']],
  ['/app.js', ['src/app.js', 'text/javascript; charset=utf-8']],
  ['/data.js', ['src/domain/performance.js', 'text/javascript; charset=utf-8']],
  ['/style.css', ['src/styles/main.css', 'text/css; charset=utf-8']],
  ['/icon.svg', ['public/assets/icon.svg', 'image/svg+xml']],
  ['/uae-pass.svg', ['public/assets/uae-pass.svg', 'image/svg+xml']],
]);
function createServer() {
  return http.createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'same-origin');
    res.setHeader('Cache-Control', 'no-cache');
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(405, { Allow: 'GET, HEAD' });
      return res.end('Method not allowed');
    }
    let pathname;
    try { pathname = decodeURIComponent(req.url.split('?')[0]); }
    catch { res.writeHead(400); return res.end('Invalid URL'); }
    const asset = assets.get(pathname);
    if (!asset) { res.writeHead(404); return res.end('Not found'); }
    try {
      const data = await fs.readFile(path.join(projectRoot, asset[0]));
      res.writeHead(200, { 'Content-Type': asset[1], 'Content-Length': data.length });
      res.end(req.method === 'HEAD' ? undefined : data);
    } catch { res.writeHead(500); res.end('Application asset unavailable'); }
  });
}
if (require.main === module) {
  const port = Number(process.env.PORT || 5180);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw Error('PORT must be between 1 and 65535.');
  createServer().listen(port, '127.0.0.1', () => console.log(`ITQAN IQ: http://localhost:${port}`));
}
module.exports = { createServer };
