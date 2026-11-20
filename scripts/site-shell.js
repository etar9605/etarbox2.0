/* ==========================================================================
   ETARBOX — Shared Layout Shell & Per-Page Metadata
   Single source of truth for <head>, <header>, <nav>, breadcrumbs & <footer>
   ========================================================================== */

export const SITE_META = {
  brandName: 'Hộp giấy của Etar',
  tagline: 'Loài người thật kỳ quặc',
  ogImage: 'https://etarbox.onrender.com/static/etarheh.webp',
  ogUrl: 'https://etarbox.onrender.com/',
  defaultDescription: 'Hộp giấy của Etar — Lưu trữ DnD 5e homebrew, art commission, thư viện truyện và Discord bot Etar.Ai.',
};

export const PAGE_CONFIG = {
  'index.html': {
    title: 'Hộp giấy của Etar — Trang chủ',
    description: SITE_META.defaultDescription,
    extraCss: ['/assets/css/intro-magic.css'],
    extraScripts: ['/assets/js/intro-magic.js'],
  },
  'commission.html': {
    title: 'Commission — Hộp giấy của Etar',
    description: 'Bảng giá commission, điều khoản dịch vụ (TOS) và thư viện tranh mẫu của Etar.',
    breadcrumbs: [{ label: 'Trang chủ', href: '/' }, { label: 'Commission' }],
    extraScripts: ['/assets/js/lightbox.js'],
    articleSheet: true,
  },
  'bot.html': {
    title: 'Discord Bot Etar.Ai — Hộp giấy của Etar',
    description: 'Danh sách lệnh và tính năng của trợ lý Discord bot Etar.Ai.',
    breadcrumbs: [{ label: 'Trang chủ', href: '/' }, { label: 'Discord Bot' }],
    extraCss: ['/assets/css/intro-bot.css'],
    extraScripts: ['/assets/js/collapsible.js', '/assets/js/intro-bot.js'],
  },
  'dnd.html': {
    title: 'DnD 5e Homebrew — Hộp giấy của Etar',
    description: 'Kho tài liệu DnD 5e homebrew của Etar: Class, Item, Monster, Race, Spell và Book lore.',
    breadcrumbs: [{ label: 'Trang chủ', href: '/' }, { label: 'DnD 5e' }],
  },
  'dnd/book.html': {
    title: 'Sách & Lore DnD — Hộp giấy của Etar',
    description: 'Thư viện sách, thần thoại và bối cảnh thế giới DnD 5e của Etar.',
    breadcrumbs: [
      { label: 'Trang chủ', href: '/' },
      { label: 'DnD 5e', href: '/dnd.html' },
      { label: 'Sách & Lore' },
    ],
  },
  'dnd/book/ayinviel.html': {
    title: 'Ayinviel — Sách DnD · Hộp giấy của Etar',
    description: 'Hồ sơ lore về Ayinviel — Thuật sĩ thời gian, Bạo Tạc Vương Đề Phu Lâm.',
    breadcrumbs: [
      { label: 'Trang chủ', href: '/' },
      { label: 'DnD 5e', href: '/dnd.html' },
      { label: 'Sách', href: '/dnd/book.html' },
      { label: 'Ayinviel' },
    ],
    articleSheet: true,
  },
  'dnd/book/erythia.html': {
    title: 'Erythia — Sách DnD · Hộp giấy của Etar',
    description: 'Hồ sơ lore về Tân Thần Erythia — Kẻ Kế Thừa Ác Ma.',
    breadcrumbs: [
      { label: 'Trang chủ', href: '/' },
      { label: 'DnD 5e', href: '/dnd.html' },
      { label: 'Sách', href: '/dnd/book.html' },
      { label: 'Erythia' },
    ],
    articleSheet: true,
  },
  'dnd/book/kieunguyetlam.html': {
    title: 'Kiều Nguyệt Lâm — Sách DnD · Hộp giấy của Etar',
    description: 'Hồ sơ lore về Kiều Nguyệt Lâm — Nữ thần mặt trăng và những khu rừng.',
    breadcrumbs: [
      { label: 'Trang chủ', href: '/' },
      { label: 'DnD 5e', href: '/dnd.html' },
      { label: 'Sách', href: '/dnd/book.html' },
      { label: 'Kiều Nguyệt Lâm' },
    ],
    articleSheet: true,
  },
  'dnd/book/lingervox_script.html': {
    title: 'Bản thảo Du Ngữ (Lingervox Scripts) — Hộp giấy của Etar',
    description: 'Bản thảo Du Ngữ cổ xưa — sách lật 3D ghi chép về những thực thể và lời nói bị lãng quên.',
    breadcrumbs: [
      { label: 'Trang chủ', href: '/' },
      { label: 'DnD 5e', href: '/dnd.html' },
      { label: 'Sách', href: '/dnd/book.html' },
      { label: 'Bản thảo Du Ngữ' },
    ],
    extraFonts: ['Grenze+Gotisch:wght@400;600;700', 'Fondamento'],
    extraCss: ['/assets/css/book.css'],
    extraScripts: ['/assets/js/flipbook.js'],
  },
  'dnd/book/regan.html': {
    title: 'Regan — Sách DnD · Hộp giấy của Etar',
    description: 'Địa chí vùng đất Regan trù phú và truyền thuyết quanh hồ Monika.',
    breadcrumbs: [
      { label: 'Trang chủ', href: '/' },
      { label: 'DnD 5e', href: '/dnd.html' },
      { label: 'Sách', href: '/dnd/book.html' },
      { label: 'Regan' },
    ],
    articleSheet: true,
  },
  'dnd/book/vainheim.html': {
    title: 'Học viện Vainheim — Sách DnD · Hộp giấy của Etar',
    description: 'Tư liệu về Học viện Vainheim — xứ sở đào tạo thần linh.',
    breadcrumbs: [
      { label: 'Trang chủ', href: '/' },
      { label: 'DnD 5e', href: '/dnd.html' },
      { label: 'Sách', href: '/dnd/book.html' },
      { label: 'Học viện Vainheim' },
    ],
    articleSheet: true,
  },
  'dnd/book/zerbrechens.html': {
    title: 'Vương quốc thánh Zerbrechens — Sách DnD · Hộp giấy của Etar',
    description: 'Tôn giáo, thể chế chính trị, các tổ chức và bản đồ Vương quốc thánh Zerbrechens.',
    breadcrumbs: [
      { label: 'Trang chủ', href: '/' },
      { label: 'DnD 5e', href: '/dnd.html' },
      { label: 'Sách', href: '/dnd/book.html' },
      { label: 'Zerbrechens' },
    ],
    extraScripts: ['/assets/js/lightbox.js'],
    articleSheet: true,
  },
  'dnd/class.html': {
    title: 'Class DnD 5e — Hộp giấy của Etar',
    description: 'Danh sách chức nghiệp (Class) DnD 5e homebrew của Etar.',
    breadcrumbs: [
      { label: 'Trang chủ', href: '/' },
      { label: 'DnD 5e', href: '/dnd.html' },
      { label: 'Class' },
    ],
  },
  'dnd/class/dancer.html': {
    title: 'Class: Vũ Công (Dancer) — DnD 5e · Hộp giấy của Etar',
    description: 'Chi tiết chức nghiệp Vũ Công (Dancer) DnD 5e: bảng cấp độ, kỹ thuật, chuyên chức và danh sách phép.',
    breadcrumbs: [
      { label: 'Trang chủ', href: '/' },
      { label: 'DnD 5e', href: '/dnd.html' },
      { label: 'Class', href: '/dnd/class.html' },
      { label: 'Dancer' },
    ],
    extraHead: [
      '<script src="https://unpkg.com/@popperjs/core@2"></script>',
      '<script src="https://unpkg.com/tippy.js@6"></script>',
    ],
    extraScripts: ['/assets/js/dnd-dancer.js'],
    articleSheet: true,
  },
  'dnd/item.html': {
    title: 'Vật phẩm DnD 5e (Items) — Hộp giấy của Etar',
    description: 'Kho vật phẩm, vũ khí, sách và nguyên liệu DnD 5e homebrew của Etar.',
    breadcrumbs: [
      { label: 'Trang chủ', href: '/' },
      { label: 'DnD 5e', href: '/dnd.html' },
      { label: 'Items' },
    ],
    extraScripts: ['/assets/js/collapsible.js', '/assets/js/dnd-items.js'],
  },
  'dnd/monster.html': {
    title: 'Quái vật DnD 5e (Monsters) — Hộp giấy của Etar',
    description: 'Bảng chỉ số (statblock) các quái vật và thực thể DnD 5e homebrew của Etar.',
    breadcrumbs: [
      { label: 'Trang chủ', href: '/' },
      { label: 'DnD 5e', href: '/dnd.html' },
      { label: 'Monsters' },
    ],
    extraScripts: ['/assets/js/collapsible.js', '/assets/js/dnd-monsters.js'],
  },
  'dnd/race.html': {
    title: 'Chủng tộc DnD 5e (Races) — Hộp giấy của Etar',
    description: 'Danh sách chủng tộc (Race) DnD 5e homebrew của Etar.',
    breadcrumbs: [
      { label: 'Trang chủ', href: '/' },
      { label: 'DnD 5e', href: '/dnd.html' },
      { label: 'Race' },
    ],
  },
  'dnd/race/vampire.html': {
    title: 'Chủng tộc: Vampire — DnD 5e · Hộp giấy của Etar',
    description: 'Tài liệu chi tiết chủng tộc Vampire trong DnD 5e homebrew của Etar.',
    breadcrumbs: [
      { label: 'Trang chủ', href: '/' },
      { label: 'DnD 5e', href: '/dnd.html' },
      { label: 'Race', href: '/dnd/race.html' },
      { label: 'Vampire' },
    ],
    articleSheet: true,
  },
  'dnd/race/yali-yasi.html': {
    title: 'Chủng tộc: Yali-Yasi — DnD 5e · Hộp giấy của Etar',
    description: 'Tài liệu chi tiết chủng tộc Yali-Yasi (Á Lợi Á Tư) trong DnD 5e homebrew của Etar.',
    breadcrumbs: [
      { label: 'Trang chủ', href: '/' },
      { label: 'DnD 5e', href: '/dnd.html' },
      { label: 'Race', href: '/dnd/race.html' },
      { label: 'Yali-Yasi' },
    ],
    articleSheet: true,
  },
  'dnd/spell.html': {
    title: 'Phép thuật DnD 5e (Spells) — Hộp giấy của Etar',
    description: 'Kho phép thuật và bí kíp DnD 5e homebrew của Etar.',
    breadcrumbs: [
      { label: 'Trang chủ', href: '/' },
      { label: 'DnD 5e', href: '/dnd.html' },
      { label: 'Spell' },
    ],
  },
  'dnd/spell/bi-kip-tan-man.html': {
    title: 'Bí Kíp Tản Mạn — Phép thuật DnD · Hộp giấy của Etar',
    description: 'Tập hợp các phép thuật tản mạn DnD 5e trong bản thảo của Etar.',
    breadcrumbs: [
      { label: 'Trang chủ', href: '/' },
      { label: 'DnD 5e', href: '/dnd.html' },
      { label: 'Spell', href: '/dnd/spell.html' },
      { label: 'Bí Kíp Tản Mạn' },
    ],
    extraScripts: ['/assets/js/collapsible.js'],
  },
  'dnd/spell/vo-nhan-bi-kip.html': {
    title: 'Vô Nhân Bí Kíp — Phép thuật DnD · Hộp giấy của Etar',
    description: 'Tập hợp pháp thuật tiên nhân phương Đông trong Vô Nhân Bí Kíp DnD 5e.',
    breadcrumbs: [
      { label: 'Trang chủ', href: '/' },
      { label: 'DnD 5e', href: '/dnd.html' },
      { label: 'Spell', href: '/dnd/spell.html' },
      { label: 'Vô Nhân Bí Kíp' },
    ],
    extraScripts: ['/assets/js/collapsible.js'],
  },
  'library.html': {
    title: 'Thư viện — Hộp giấy của Etar',
    description: 'Thư viện manga và tiểu thuyết do Etar sưu tầm và biên tập.',
    breadcrumbs: [{ label: 'Trang chủ', href: '/' }, { label: 'Thư viện' }],
  },
  'library/doujinshi.html': {
    title: 'Manga & Doujinshi — Thư viện · Hộp giấy của Etar',
    description: 'Kệ manga và doujinshi do Etar biên dịch & chỉnh sửa.',
    breadcrumbs: [
      { label: 'Trang chủ', href: '/' },
      { label: 'Thư viện', href: '/library.html' },
      { label: 'Manga' },
    ],
  },
  'library/novel pass.html': {
    title: 'Cổng Tiểu thuyết — Thư viện · Hộp giấy của Etar',
    description: 'Khu vực tiểu thuyết yêu cầu mật khẩu.',
    breadcrumbs: [
      { label: 'Trang chủ', href: '/' },
      { label: 'Thư viện', href: '/library.html' },
      { label: 'Tiểu thuyết' },
    ],
    disableNotes: true,
  },
  'library/novel.html': {
    title: 'Tiểu thuyết — Thư viện · Hộp giấy của Etar',
    description: 'Danh sách tiểu thuyết trong thư viện của Etar.',
    breadcrumbs: [
      { label: 'Trang chủ', href: '/' },
      { label: 'Thư viện', href: '/library.html' },
      { label: 'Tiểu thuyết' },
    ],
    disableNotes: true,
  },
  'library/doujinshi/tactics pass.html': {
    title: 'Tactics — Cổng xác nhận · Hộp giấy của Etar',
    description: 'Khu vực doujinshi yêu cầu mật khẩu.',
    breadcrumbs: [
      { label: 'Trang chủ', href: '/' },
      { label: 'Thư viện', href: '/library.html' },
      { label: 'Manga', href: '/library/doujinshi.html' },
      { label: 'Tactics' },
    ],
    disableNotes: true,
  },
  'library/doujinshi/tactics.html': {
    title: 'Tactics — Doujinshi · Hộp giấy của Etar',
    description: 'Tactics — Mitsugu Fujii (Trans & Edit: Etar).',
    breadcrumbs: [
      { label: 'Trang chủ', href: '/' },
      { label: 'Thư viện', href: '/library.html' },
      { label: 'Manga', href: '/library/doujinshi.html' },
      { label: 'Tactics' },
    ],
    disableNotes: true,
  },
};

export function renderHead(relPath) {
  const cfg = PAGE_CONFIG[relPath] || {
    title: SITE_META.brandName,
    description: SITE_META.defaultDescription,
  };

  const baseFonts = [
    'Allura',
    'Be+Vietnam+Pro:ital,wght@0,400;0,500;0,600;0,700;1,400',
    'Nunito:ital,wght@0,600;0,700;0,800;1,600;1,700',
    'JetBrains+Mono:wght@400;500',
  ];
  const allFonts = [...baseFonts, ...(cfg.extraFonts || [])];
  const googleFontsUrl = `https://fonts.googleapis.com/css2?${allFonts
    .map((f) => `family=${f}`)
    .join('&')}&display=swap`;

  const cssLinks = [
    '/assets/css/tokens.css',
    '/assets/css/base.css',
    '/assets/css/layout.css',
    '/assets/css/components.css',
    '/assets/css/effects.css',
    ...(cfg.disableNotes ? [] : ['/assets/css/notes-drawer.css']),
    ...(cfg.extraCss || []),
  ]
    .map((href) => `    <link rel="stylesheet" href="${href}">`)
    .join('\n');

  const extraHead = (cfg.extraHead || []).map((line) => `    ${line}`).join('\n');

  return `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${cfg.title}</title>
    <meta name="description" content="${cfg.description}">

    <meta property="og:title" content="${cfg.title}" />
    <meta property="og:description" content="${cfg.description}" />
    <meta property="og:image" content="${SITE_META.ogImage}" />
    <meta property="og:url" content="${SITE_META.ogUrl}" />
    <meta property="og:type" content="website" />

    <link rel="icon" type="image/webp" href="/static/etarmm.webp">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="${googleFontsUrl}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
${cssLinks}${extraHead ? '\n' + extraHead : ''}
</head>`;
}

export function renderHeaderAndNav(relPath) {
  const cfg = PAGE_CONFIG[relPath] || {};
  let breadcrumbsHtml = '';
  if (cfg.breadcrumbs && cfg.breadcrumbs.length > 0) {
    const items = cfg.breadcrumbs
      .map((crumb, idx) => {
        const isLast = idx === cfg.breadcrumbs.length - 1;
        if (isLast || !crumb.href) {
          return `<span class="crumb-current">${crumb.label}</span>`;
        }
        return `<a href="${crumb.href}">${crumb.label}</a>`;
      })
      .join('<span class="crumb-sep" aria-hidden="true">/</span>');
    breadcrumbsHtml = `\n    <div class="site-breadcrumbs" aria-label="Điều hướng">${items}</div>`;
  }

  return `<body>
    <div id="star-container" aria-hidden="true"></div>

    <header class="site-header">
        <a href="/" class="header-brand">
            <img src="/static/etarheh.webp" alt="Etar" class="header-avatar" width="96" height="96">
            <div class="header-titles">
                <h1>${SITE_META.brandName}</h1>
                <p class="header-tagline">${SITE_META.tagline}</p>
            </div>
        </a>
    </header>

    <nav class="site-nav" aria-label="Điều hướng chính">
        <div class="nav-wrapper">
            <button type="button" class="nav-toggle" title="Mở menu" aria-label="Mở menu" aria-expanded="false" data-toggle="collapse" data-target="#navbar">
                <i class="fas fa-bars" aria-hidden="true"></i>
            </button>

            <div class="nav-links-collapse" id="navbar">
                <div class="navbar-nav">
                    <a class="nav-link" id="home" href="/">Home</a>
                    <a class="nav-link" id="commission" href="/commission.html">Commission</a>
                    <a class="nav-link" id="dnd" href="/dnd.html">DnD</a>
                    <a class="nav-link" id="library" href="/library.html">Thư viện</a>
                    <a class="nav-link" id="bot" href="/bot.html">Discord bot</a>
                </div>
            </div>

            <div class="search-container">
                <input type="text" id="searchInput" placeholder="Tìm gì nào..." title="Tìm kiếm toàn trang web (nhấn / để mở nhanh)" autocomplete="off">
                <i class="fas fa-search" aria-hidden="true"></i>
            </div>
        </div>
    </nav>${breadcrumbsHtml}

    <div class="magic-cursor" id="magic-cursor" aria-hidden="true"></div>

    <button type="button" onclick="scrollToTop()" id="scrollToTopBtn" title="Trượt về đầu trang" aria-label="Trượt về đầu trang">
        <i class="fas fa-arrow-up" aria-hidden="true"></i>
    </button>`;
}

export function renderFooterAndScripts(relPath) {
  const cfg = PAGE_CONFIG[relPath] || {};
  const scripts = [
    '/assets/js/core.js',
    '/assets/js/effects.js',
    '/assets/js/search.js',
    ...(cfg.extraScripts || []),
  ]
    .map((src) => `    <script src="${src}"></script>`)
    .concat(cfg.disableNotes ? [] : ['    <script type="module" src="/assets/js/notes-drawer.js"></script>'])
    .join('\n');

  return `
    <footer class="site-footer">
        <p class="footer-copy">&copy; 2024, Etar Ai</p>
        <div class="footer-links">
            <a class="footer-icon-link" title="Tham gia server discord" href="https://discord.gg/pQK5pCm2hC">
                <img src="/static/dc.webp" alt="Discord" height="20">
                <span>Discord</span>
            </a>
            <a class="footer-icon-link" title="Liên hệ: etar.9605@gmail.com" href="mailto:etar.9605@gmail.com">
                <img src="/static/mail icon.webp" alt="Gmail" height="18">
                <span>Email</span>
            </a>
        </div>
    </footer>

${scripts}
</body>
</html>
`;
}
