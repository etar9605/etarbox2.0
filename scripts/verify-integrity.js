/* ==========================================================================
   ETARBOX — Automated Integrity & Asset Verification Audit
   Checks:
   1. All JSON data files parse cleanly and preserve expected record counts
   2. All local href/src/data-full paths across HTML & JSON resolve to existing files
   3. Zero references remain to deprecated /styles/ or /script/ paths
   4. Search index excludes private password-gated & draft pages
   ========================================================================== */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const KNOWN_UNCREATED_LINKS = new Set(['/library/novel/vongnhan/']);

function walk(dir, base = '') {
  let out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const rel = base ? `${base}/${entry.name}` : entry.name;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out = out.concat(walk(full, rel));
    else out.push(rel);
  }
  return out;
}

const errors = [];

// 1. Validate JSON datasets
const jsonChecks = [
  ['dnd/data/dnd_items.json', 25],
  ['dnd/data/dnd_monsters.json', 11],
  ['dnd/data/dancer_streams.json', 4],
  ['assets/data/emojis.json', 1],
];

for (const [rel, expectedMin] of jsonChecks) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) {
    errors.push(`Missing JSON file: ${rel}`);
    continue;
  }
  const data = JSON.parse(fs.readFileSync(full, 'utf8'));
  if (!Array.isArray(data) || data.length < expectedMin) {
    errors.push(`${rel}: expected at least ${expectedMin} items, got ${data.length}`);
  }
  // Check image_src / src references inside JSON
  for (const row of data) {
    const imgPath = row.image_src || row.src;
    if (imgPath && imgPath.startsWith('/')) {
      const cleanPath = decodeURIComponent(imgPath.split('?')[0]).replace(/^\//, '');
      if (!fs.existsSync(path.join(ROOT, cleanPath))) {
        errors.push(`${rel}: missing image ${imgPath}`);
      }
    }
  }
}

// 2. Validate HTML files (excluding _drafts)
const allFiles = walk(ROOT);
const htmlFiles = allFiles.filter((f) => f.endsWith('.html') && !f.startsWith('_drafts/'));

for (const rel of htmlFiles) {
  const content = fs.readFileSync(path.join(ROOT, rel), 'utf8');

  if (/["']\/styles\/|["']\/script\//.test(content)) {
    errors.push(`${rel}: still references legacy /styles/ or /script/ path`);
  }

  const attrRegex = /(?:src|href|data-full)="(\/[^"#?]+)"/gi;
  let m;
  while ((m = attrRegex.exec(content)) !== null) {
    const rawUrl = m[1];
    if (rawUrl === '/' || KNOWN_UNCREATED_LINKS.has(rawUrl)) continue;
    const clean = decodeURIComponent(rawUrl).replace(/^\//, '');
    const candidate = path.join(ROOT, clean);
    const htmlCandidate = path.join(ROOT, clean.replace(/\/$/, '') + '.html');
    if (!fs.existsSync(candidate) && !fs.existsSync(htmlCandidate)) {
      errors.push(`${rel}: broken local path ${rawUrl}`);
    }
  }
}

// 3. Validate search-index.json excludes private pages
const indexPath = path.join(ROOT, 'search-index.json');
if (!fs.existsSync(indexPath)) {
  errors.push('Missing search-index.json');
} else {
  const idx = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  const privateUrls = new Set(['/library/novel.html', '/library/doujinshi/tactics.html', '/_drafts/rate.html']);
  for (const entry of idx) {
    if (privateUrls.has(entry.url)) {
      errors.push(`search-index.json leaked private URL: ${entry.url}`);
    }
  }
}

if (errors.length > 0) {
  console.error('Integrity check FAILED:');
  for (const e of errors) console.error('  -', e);
  process.exit(1);
} else {
  console.log(`Integrity check PASSED across ${htmlFiles.length} HTML pages and 3 JSON datasets.`);
}
