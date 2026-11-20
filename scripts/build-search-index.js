/* ==========================================================================
   ETARBOX — Site-Wide Search Index Builder
   Indexes all public HTML pages + DnD JSON datasets into /search-index.json
   Excludes drafts and password-protected target pages.
   ========================================================================== */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const EXCLUDED_FILES = new Set([
  '_drafts/rate.html',
  'library/novel.html',
  'library/doujinshi/tactics.html',
]);

const PAGE_META = {
  'index.html': { url: '/', title: 'Trang chủ — Hộp giấy của Etar', section: 'Trang chủ' },
  'commission.html': { url: '/commission.html', title: 'Commission — Bảng giá & Điều khoản', section: 'Commission' },
  'bot.html': { url: '/bot.html', title: 'Discord Bot — Etar.Ai', section: 'Discord Bot' },
  'dnd.html': { url: '/dnd.html', title: 'Dungeon & Dragon 5e', section: 'DnD 5e' },
  'dnd/book.html': { url: '/dnd/book.html', title: 'Thư viện Sách & Lore DnD', section: 'DnD · Sách' },
  'dnd/book/ayinviel.html': { url: '/dnd/book/ayinviel.html', title: 'Ayinviel', section: 'DnD · Sách' },
  'dnd/book/erythia.html': { url: '/dnd/book/erythia.html', title: 'Erythia', section: 'DnD · Sách' },
  'dnd/book/kieunguyetlam.html': { url: '/dnd/book/kieunguyetlam.html', title: 'Kiều Nguyệt Lâm', section: 'DnD · Sách' },
  'dnd/book/lingervox_script.html': { url: '/dnd/book/lingervox_script.html', title: 'Bản thảo Du Ngữ (Lingervox Scripts)', section: 'DnD · Sách' },
  'dnd/book/regan.html': { url: '/dnd/book/regan.html', title: 'Regan', section: 'DnD · Sách' },
  'dnd/book/vainheim.html': { url: '/dnd/book/vainheim.html', title: 'Học viện Vainheim', section: 'DnD · Sách' },
  'dnd/book/zerbrechens.html': { url: '/dnd/book/zerbrechens.html', title: 'Vương quốc thánh Zerbrechens', section: 'DnD · Sách' },
  'dnd/class.html': { url: '/dnd/class.html', title: 'Class DnD 5e', section: 'DnD · Class' },
  'dnd/class/dancer.html': { url: '/dnd/class/dancer.html', title: 'Class: Dancer', section: 'DnD · Class' },
  'dnd/item.html': { url: '/dnd/item.html', title: 'Vật phẩm DnD (Items)', section: 'DnD · Vật phẩm' },
  'dnd/monster.html': { url: '/dnd/monster.html', title: 'Quái vật DnD (Monsters)', section: 'DnD · Quái vật' },
  'dnd/race.html': { url: '/dnd/race.html', title: 'Chủng tộc DnD (Races)', section: 'DnD · Chủng tộc' },
  'dnd/race/vampire.html': { url: '/dnd/race/vampire.html', title: 'Chủng tộc: Vampire', section: 'DnD · Chủng tộc' },
  'dnd/race/yali-yasi.html': { url: '/dnd/race/yali-yasi.html', title: 'Chủng tộc: Yali-Yasi', section: 'DnD · Chủng tộc' },
  'dnd/spell.html': { url: '/dnd/spell.html', title: 'Phép thuật & Bí kíp DnD', section: 'DnD · Phép thuật' },
  'dnd/spell/bi-kip-tan-man.html': { url: '/dnd/spell/bi-kip-tan-man.html', title: 'Bí Kíp Tản Mạn', section: 'DnD · Phép thuật' },
  'dnd/spell/vo-nhan-bi-kip.html': { url: '/dnd/spell/vo-nhan-bi-kip.html', title: 'Vô Nhân Bí Kíp', section: 'DnD · Phép thuật' },
  'library.html': { url: '/library.html', title: 'Thư viện', section: 'Thư viện' },
  'library/doujinshi.html': { url: '/library/doujinshi.html', title: 'Thư viện Doujinshi', section: 'Thư viện' },
  'library/novel pass.html': { url: '/library/novel pass.html', title: 'Tiểu thuyết (Khóa mật khẩu)', section: 'Thư viện' },
  'library/doujinshi/tactics pass.html': { url: '/library/doujinshi/tactics pass.html', title: 'Doujinshi: Tactics (Khóa mật khẩu)', section: 'Thư viện' },
};

function decodeEntities(str) {
  return str
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&copy;/gi, '©')
    .replace(/&mdash;/gi, '—')
    .replace(/&ndash;/gi, '–')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function stripHtmlToText(html) {
  const mainMatch = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  let body = mainMatch ? mainMatch[1] : html;
  body = body
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ');
  return decodeEntities(body).replace(/\s+/g, ' ').trim();
}

function cleanWikiHighlight(text) {
  if (!text) return '';
  return String(text).replace(/\[\[(.*?)(?:\|(.*?))?\]\]/g, (_, word, tip) =>
    tip ? `${word} (${tip})` : word
  );
}

function walkHtml(dir, base = '') {
  let out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const rel = base ? `${base}/${entry.name}` : entry.name;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out = out.concat(walkHtml(full, rel));
    } else if (entry.name.endsWith('.html')) {
      out.push(rel);
    }
  }
  return out;
}

export function buildSearchIndex() {
  const entries = [];
  const htmlFiles = walkHtml(ROOT).sort();

  for (const rel of htmlFiles) {
    if (EXCLUDED_FILES.has(rel)) continue;
    const meta = PAGE_META[rel] || {
      url: '/' + rel,
      title: path.basename(rel, '.html'),
      section: 'Trang',
    };
    const rawHtml = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    let content = stripHtmlToText(rawHtml);

    if (rel === 'dnd/class/dancer.html') {
      const streamsPath = path.join(ROOT, 'dnd/data/dancer_streams.json');
      if (fs.existsSync(streamsPath)) {
        const streams = JSON.parse(fs.readFileSync(streamsPath, 'utf8'));
        const streamParts = [];
        for (const s of streams) {
          streamParts.push(s.title || '', cleanWikiHighlight(s.intro || ''));
          for (const f of s.features || []) {
            streamParts.push(f.title || '', cleanWikiHighlight(f.description || ''));
            for (const st of f.styles || []) {
              streamParts.push(st.name || '', cleanWikiHighlight(st.effect || ''));
            }
            if (f.table) {
              streamParts.push(...(f.table.headers || []));
              for (const row of f.table.rows || []) {
                streamParts.push(...row.map(cleanWikiHighlight));
              }
            }
          }
        }
        content = `${content} ${streamParts.join(' ')}`.replace(/\s+/g, ' ').trim();
      }
    }

    if (rel !== 'dnd/item.html' && rel !== 'dnd/monster.html') {
      entries.push({
        url: meta.url,
        title: meta.title,
        section: meta.section,
        content,
      });
    }
  }

  const itemsPath = path.join(ROOT, 'dnd/data/dnd_items.json');
  if (fs.existsSync(itemsPath)) {
    const items = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
    for (const item of items) {
      const text = [
        item.name,
        item.type_stats,
        (item.tags || []).join(' '),
        stripHtmlToText(item.desc_main || ''),
        stripHtmlToText(item.desc_extra || ''),
      ]
        .filter(Boolean)
        .join(' — ')
        .replace(/\s+/g, ' ')
        .trim();

      entries.push({
        url: '/dnd/item.html',
        title: item.name || 'Vật phẩm DnD',
        section: 'DnD · Vật phẩm',
        content: text,
      });
    }
  }

  const monstersPath = path.join(ROOT, 'dnd/data/dnd_monsters.json');
  if (fs.existsSync(monstersPath)) {
    const monsters = JSON.parse(fs.readFileSync(monstersPath, 'utf8'));
    for (const m of monsters) {
      const parts = [
        m.name,
        `${m.size || ''} ${m.type || ''}, ${m.alignment || ''}`.trim(),
        m.skills,
        m.languages,
        ...(m.features || []).map((f) => `${f.name}: ${stripHtmlToText(f.description || '')}`),
        ...(m.actions || []).map((a) => `${a.name}: ${stripHtmlToText(a.description || '')}`),
        ...(m.bonus_actions || []).map((a) => `${a.name}: ${stripHtmlToText(a.description || '')}`),
        ...(m.reactions || []).map((r) => `${r.name}: ${stripHtmlToText(r.description || '')}`),
        stripHtmlToText(m.description_footer || ''),
      ];
      const text = parts.filter(Boolean).join(' · ').replace(/\s+/g, ' ').trim();

      entries.push({
        url: '/dnd/monster.html',
        title: m.name || 'Quái vật DnD',
        section: 'DnD · Quái vật',
        content: text,
      });
    }
  }

  const outPath = path.join(ROOT, 'search-index.json');
  fs.writeFileSync(outPath, JSON.stringify(entries), 'utf8');
  return entries.length;
}

if (process.argv[1] === __filename) {
  const count = buildSearchIndex();
  console.log(`Generated search-index.json with ${count} entries.`);
}
