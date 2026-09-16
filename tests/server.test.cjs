const { test } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { createServer } = require('../server/index.cjs');
test('HTTP server serves public assets and safely rejects private paths and malformed requests', async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const request = (path, method = 'GET') => new Promise((resolve, reject) => {
    const req = http.request({ hostname: '127.0.0.1', port: server.address().port, path, method }, res => {
      let body = '';res.on('data', chunk => { body += chunk; });res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });req.on('error', reject);req.end();
  });
  try {
    for (const file of ['/', '/app.js', '/workspace.js', '/data.js', '/style.css', '/icon.svg', '/uae-pass.svg']) {
      const res = await request(file);assert.equal(res.status, 200);assert.ok(res.body.length);assert.equal(res.headers['x-content-type-options'], 'nosniff');
    }
    for (const path of ['/.git/config', '/package.json', '/README.md', '/tests/actions.test.cjs', '/doc/ARCHITECTURE.md', '/server/index.cjs', '/src/app.js', '/../server/index.cjs', '/%2e%2e/server/index.cjs']) assert.equal((await request(path)).status, 404, path);
    assert.equal((await request('/%ZZ')).status, 400);assert.equal((await request('/', 'POST')).status, 405);
    const head = await request('/app.js', 'HEAD');assert.equal(head.status, 200);assert.equal(head.body, '');assert.ok(Number(head.headers['content-length']) > 0);
    assert.equal((await request('/')).status, 200);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
