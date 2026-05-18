#!/usr/bin/env node
/*
 * build.js - assemble a deployable folder under dist/.
 *
 * The Office Add-in itself is a static web app, so "build" just means
 * copying the manifest, web assets, and icons into a single folder that
 * can be hosted (GitHub Pages, Azure Static Web Apps, etc.).
 */

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

const FILES = [
    'manifest.xml',
    'LICENSE',
    'README.md',
    'src/lib/titlecase.js',
    'src/taskpane/taskpane.html',
    'src/taskpane/taskpane.css',
    'src/taskpane/taskpane.js',
    'src/commands/commands.html',
    'src/commands/commands.js'
];

function copyFile(rel) {
    const src = path.join(ROOT, rel);
    const dst = path.join(DIST, rel);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
    console.log(`copy ${rel}`);
}

function copyAssets() {
    const srcDir = path.join(ROOT, 'assets');
    const dstDir = path.join(DIST, 'assets');
    if (!fs.existsSync(srcDir)) return;
    fs.mkdirSync(dstDir, { recursive: true });
    for (const f of fs.readdirSync(srcDir)) {
        fs.copyFileSync(path.join(srcDir, f), path.join(dstDir, f));
        console.log(`copy assets/${f}`);
    }
}

function rmrf(p) {
    if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

function main() {
    rmrf(DIST);
    fs.mkdirSync(DIST, { recursive: true });
    for (const f of FILES) copyFile(f);
    copyAssets();
    console.log('\nBuild complete. Output in dist/.');
    console.log('Host the contents of dist/ on an HTTPS server, then');
    console.log('sideload manifest.xml into Word/Excel/PowerPoint.');
}

main();
