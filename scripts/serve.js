#!/usr/bin/env node
/*
 * Minimal HTTPS-capable static dev server. Office Add-ins must be served
 * over HTTPS in production, but Office's sideload mode will also accept
 * an http://localhost: source location, which is what we use for quick
 * local testing. To get HTTPS during development, generate a self-signed
 * certificate and set TITLE_CAPITALIZER_KEY / TITLE_CAPITALIZER_CERT.
 */

const http  = require('http');
const https = require('https');
const path  = require('path');
const fs    = require('fs');

const PORT  = parseInt(process.env.PORT || '3000', 10);
const ROOT  = path.resolve(__dirname, '..');
const KEY   = process.env.TITLE_CAPITALIZER_KEY;
const CERT  = process.env.TITLE_CAPITALIZER_CERT;

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js'  : 'application/javascript; charset=utf-8',
    '.css' : 'text/css; charset=utf-8',
    '.png' : 'image/png',
    '.svg' : 'image/svg+xml',
    '.xml' : 'application/xml; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.ico' : 'image/x-icon'
};

function handle(req, res) {
    let urlPath = decodeURIComponent(req.url.split('?')[0]);
    if (urlPath === '/') urlPath = '/src/taskpane/taskpane.html';
    const filePath = path.join(ROOT, urlPath);

    // Don't allow escaping ROOT via path traversal.
    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403); res.end('Forbidden'); return;
    }

    fs.stat(filePath, (err, stat) => {
        if (err || !stat.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not found: ' + urlPath);
            return;
        }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, {
            'Content-Type': MIME[ext] || 'application/octet-stream',
            'Access-Control-Allow-Origin': '*'
        });
        fs.createReadStream(filePath).pipe(res);
    });
}

if (KEY && CERT) {
    https.createServer({
        key: fs.readFileSync(KEY),
        cert: fs.readFileSync(CERT)
    }, handle).listen(PORT, () => {
        console.log(`Title Capitalizer serving on https://localhost:${PORT}`);
    });
} else {
    http.createServer(handle).listen(PORT, () => {
        console.log(`Title Capitalizer serving on http://localhost:${PORT}`);
        console.log('For HTTPS, set TITLE_CAPITALIZER_KEY and TITLE_CAPITALIZER_CERT.');
    });
}
