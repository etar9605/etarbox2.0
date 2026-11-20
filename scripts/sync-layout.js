/* ==========================================================================
   ETARBOX — Layout Synchronization Script
   Applies the shared header/nav/footer/assets from scripts/site-shell.js
   to every HTML page while preserving 100% of each page's <main> content.
   ========================================================================== */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PAGE_CONFIG, renderHead, renderHeaderAndNav, renderFooterAndScripts } from './site-shell.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

function extractPageInner(html, relPath) {
  // Special case: index.html has #magic-intro right before <main>
  let preMain = '';
  if (relPath === 'index.html') {
    const introMatch = html.match(/(<!--\s*INTRO OVERLAY\s*-->[\s\S]*?<\/div>\s*)(?=<main\b)/i);
    if (introMatch) {
      preMain = introMatch[1].trim() + '\n\n';
    }
  }

  const mainMatch = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  if (mainMatch) {
    return { preMain, mainInner: mainMatch[1] };
  }

  // Fallback for pages missing <main> (e.g., dnd.html, library/doujinshi.html)
  const scrollBtnIdx = html.indexOf('id="scrollToTopBtn"');
  if (scrollBtnIdx !== -1) {
    const afterBtn = html.indexOf('</button>', scrollBtnIdx);
    const footerOrScript = html.search(/<script\s+src="\/(?:script|assets\/js)\/(?:star|core)\.js|<footer\b/i);
    if (afterBtn !== -1 && footerOrScript !== -1 && footerOrScript > afterBtn) {
      let middle = html.slice(afterBtn + '</button>'.length, footerOrScript);
      middle = middle.replace(/<\/main>/gi, '');
      return { preMain, mainInner: middle };
    }
  }

  throw new Error(`Could not extract <main> content for ${relPath}`);
}

function cleanMainMarkup(mainInner, relPath) {
  let out = mainInner;

  // Replace legacy inline script loaders inside <main> that are now loaded cleanly in footer scripts
  out = out
    .replace(/\s*<script\s+src="\/script\/item-loader\.js"><\/script>/gi, '')
    .replace(/\s*<script\s+src="\/script\/monster-loader\.js"><\/script>/gi, '')
    .replace(/\s*<script\s+src="\/script\/loadStreamAccordion\.js"><\/script>/gi, '');

  // Upgrade the raw inline-styled banner strips ("Etar's Manuscripts", "5e homebrew", "Term of service", "Vampire", "Tiểu thuyết")
  out = out.replace(
    /<div\s+style="text-align:\s*center;\s*background-color:\s*rgba\([^)]+\);\s*backdrop-filter:[^"]+"[^>]*>\s*(<h[23][^>]*>[\s\S]*?<\/h[23]>)\s*<\/div>/gi,
    '<div class="page-banner">$1</div>'
  );

  // Remove dark inline color on links that made them unreadable against dark glass panels
  out = out.replace(/(<a\b[^>]*?)\s+style="color:\s*#040836;?"/gi, '$1');

  // Ensure overlay img tag is clean valid HTML (was `<img id="overlay-img" / loading="lazy"...>`)
  out = out.replace(/<img\s+id="overlay-img"\s*\/\s*loading="lazy"\s*decoding="async"\s*>/gi, '<img id="overlay-img" alt="Xem ảnh lớn" decoding="async">');

  // Page-specific safe structural cleanups (preserving 100% of text, data, links, and images)
  if (relPath === 'bot.html') {
    // Fix broken premature </a> before the Discord invite button so the invite link works!
    out = out.replace(
      /<a\s+href="(https:\/\/discord\.com\/oauth2\/authorize[^"]+)">\s*<\/a>\s*<button[^>]*>([\s\S]*?)<\/button>\s*<\/a>/i,
      '<div style="text-align: center;"><a class="bot-invite-link" href="$1" target="_blank" rel="noopener noreferrer">$2<span>Mời Etar.Ai vào Server</span></a></div>'
    );
    // Mark bot command collapsible cards so their 3rd child displays as block instead of 2-column grid
    out = out.replace(/class="item-container container divider"/g, 'class="item-container bot-cmd-card container divider"');
    // Remove inline font-family override on #main-content
    out = out.replace(/id="main-content"\s+style="font-family:\s*'Nunito';?"/i, 'id="main-content"');
  }

  if (relPath === 'dnd/book/lingervox_script.html') {
    // Wrap book stage cleanly and add page indicator between prev/next buttons (idempotent)
    if (!out.includes('book-stage')) {
      out = out.replace('<div class="container divider">\n            <div class="book">', '<div class="container divider book-stage">\n            <div class="book">');
    }
    if (!out.includes('book-controls')) {
      out = out.replace(
        /<div\s+style="display:\s*grid;\s*grid-template-columns:[^"]+">\s*<div>(<button\s+id="prevBtn"[\s\S]*?<\/button>)<\/div>\s*<div>(<button\s+id="nextBtn"[\s\S]*?<\/button>)<\/div>\s*<\/div>/i,
        '<div class="book-controls">\n            $1\n            <span id="bookPageIndicator" class="book-page-indicator">Trang 1 / 2</span>\n            $2\n        </div>'
      );
    }
  }

  if (relPath === 'library/novel pass.html' || relPath === 'library/doujinshi/tactics pass.html') {
    // Wrap password input + button in a clean flex group without changing IDs, handlers, or password logic (idempotent)
    if (!out.includes('password-gate-form')) {
      out = out.replace(
        /(<input\s+type="password"\s+id="passwordInput"[^>]*>)\s*(<button\s+onclick="checkPassword\(\)"[^>]*>[\s\S]*?<\/button>)/i,
        '<div class="password-gate-form">$1$2</div>'
      );
    }
  }

  if (relPath === 'dnd/class/dancer.html') {
    // Ensure loadStreamAccordion runs after deferred footer script loads (idempotent)
    if (!out.includes("addEventListener('DOMContentLoaded'")) {
      out = out.replace(
        /<script>\s*loadStreamAccordion\("dancer_subclass",\s*"\/dnd\/data\/dancer_streams\.json"\);\s*<\/script>/i,
        `<script>\n        document.addEventListener('DOMContentLoaded', function () {\n            if (typeof loadStreamAccordion === 'function') {\n                loadStreamAccordion("dancer_subclass", "/dnd/data/dancer_streams.json");\n            }\n        });\n    </script>`
      );
    }
  }

  if (PAGE_CONFIG[relPath]?.articleSheet) {
    out = wrapArticleSheet(out);
  }

  return out;
}

function wrapArticleSheet(html) {
  if (html.includes('class="manuscript-sheet"')) {
    return html;
  }

  let body = html;
  let leadingBanner = '';
  let trailingOverlay = '';

  const bannerMatch = body.match(/^\s*(<div\s+class="page-banner"[^>]*>[\s\S]*?<\/div>)/i);
  if (bannerMatch) {
    leadingBanner = bannerMatch[1];
    body = body.slice(bannerMatch[0].length);
  }

  const overlayMatch = body.match(/(<div\s+id="overlay"[^>]*>[\s\S]*?<\/div>)\s*$/i);
  if (overlayMatch) {
    trailingOverlay = overlayMatch[1];
    body = body.slice(0, body.length - overlayMatch[0].length);
  }

  const innerTrimmed = body.trim();
  if (!innerTrimmed) return html;

  const parts = [];
  if (leadingBanner) {
    parts.push(`\n    ${leadingBanner}`);
  }
  parts.push(`\n    <div class="manuscript-sheet">\n    ${innerTrimmed}\n    </div>`);
  if (trailingOverlay) {
    parts.push(`\n    ${trailingOverlay}`);
  }
  return parts.join('\n') + '\n';
}

export function syncAllPages() {
  const files = Object.keys(PAGE_CONFIG);
  let updated = 0;

  for (const relPath of files) {
    const absPath = path.join(ROOT, relPath);
    if (!fs.existsSync(absPath)) {
      console.warn(`Skipping missing page: ${relPath}`);
      continue;
    }

    const raw = fs.readFileSync(absPath, 'utf8').replace(/\r\n/g, '\n');
    const { preMain, mainInner } = extractPageInner(raw, relPath);
    const cleanedMain = cleanMainMarkup(mainInner, relPath);

    const rebuilt = [
      renderHead(relPath),
      renderHeaderAndNav(relPath),
      preMain ? `\n${preMain}` : '',
      `\n    <main>${cleanedMain}</main>`,
      renderFooterAndScripts(relPath),
    ].join('\n');

    fs.writeFileSync(absPath, rebuilt, 'utf8');
    updated++;
  }

  return updated;
}

if (process.argv[1] === __filename) {
  const count = syncAllPages();
  console.log(`Synchronized shared layout across ${count} HTML pages.`);
}
