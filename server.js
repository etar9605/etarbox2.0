import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildSearchIndex } from './scripts/build-search-index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Keep site-wide search index fresh on startup
buildSearchIndex();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

// Prevent serving server/project metadata and build tooling files
const blockedPaths = new Set([
  '/server.js',
  '/package.json',
  '/package-lock.json',
  '/bun.lock',
  '/firestore.rules',
  '/firebase-blueprint.json',
  '/eslint.config.mjs',
]);

app.use((req, res, next) => {
  if (
    blockedPaths.has(req.path) ||
    req.path.startsWith('/node_modules') ||
    req.path.startsWith('/scripts/')
  ) {
    return res.status(404).send('Not Found');
  }
  // Support clean trailing-slash URLs (e.g. /commission/ -> /commission.html)
  if (req.path.length > 1 && req.path.endsWith('/')) {
    const trimmed = req.path.slice(0, -1);
    const htmlCandidate = path.join(__dirname, `${trimmed}.html`);
    if (fs.existsSync(htmlCandidate)) {
      return res.sendFile(htmlCandidate);
    }
  }
  next();
});

app.use(
  express.static(__dirname, {
    extensions: ['html'],
    dotfiles: 'ignore',
    setHeaders(res, filePath) {
      if (/\.(webp|png|jpg|jpeg|gif|svg|ico|woff2?)$/i.test(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
      } else if (/\.(css|js|json)$/i.test(filePath)) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    },
  })
);

app.listen(PORT, HOST, () => {
  console.log(`Etarbox static server running at http://${HOST}:${PORT}`);
});
