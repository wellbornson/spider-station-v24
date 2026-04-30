// server.js — CLICK Cafe OS Production Server
// Custom Next.js server. Run with: node server.js
// Does NOT require output:'standalone' — works directly from node_modules.

'use strict';

const http = require('http');
const { parse } = require('url');
const path = require('path');
const next = require('next');

const PORT     = parseInt(process.env.PORT || '3000', 10);
const HOSTNAME = process.env.HOSTNAME || '0.0.0.0';
const DIR      = path.resolve(__dirname);

const app    = next({ dev: false, hostname: HOSTNAME, port: PORT, dir: DIR });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  http.createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('[server] Error handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  }).listen(PORT, HOSTNAME, (err) => {
    if (err) throw err;
    console.log(`> CLICK Cafe OS ready on http://${HOSTNAME}:${PORT}`);
  });
}).catch((err) => {
  console.error('[server] Failed to start:', err);
  process.exit(1);
});
