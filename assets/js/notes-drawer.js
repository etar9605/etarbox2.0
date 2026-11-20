/* ==========================================================================
   ETARBOX — Anonymous Sticky Notes Drawer & Custom Image Emoji Reactions
   Firebase Firestore + Google Owner Moderation (etar.9605@gmail.com)
   ========================================================================== */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocFromServer,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';

const OWNER_EMAILS = new Set(['etar.9605@gmail.com', 'tieuthienbinhngoc@gmail.com']);
const COOLDOWN_MS = 30 * 1000;
const MAX_NICKNAME_LEN = 32;
const MAX_MESSAGE_LEN = 280;
const VALID_TONES = ['mist', 'lavender', 'moon', 'teal'];
const TONE_LABELS = {
  mist: 'Sương Lam',
  lavender: 'Tử Đinh Hương',
  moon: 'Nguyệt Bạch',
  teal: 'Thanh Ngọc',
};

const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
};

let db = null;
let auth = null;

function handleFirestoreError(error, operationType, path) {
  const user = auth ? auth.currentUser : null;
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: user ? user.uid : null,
      email: user ? user.email : null,
      emailVerified: user ? user.emailVerified : null,
      isAnonymous: user ? user.isAnonymous : null,
      tenantId: user ? user.tenantId : null,
      providerInfo:
        user && Array.isArray(user.providerData)
          ? user.providerData.map((p) => ({
              providerId: p.providerId,
              email: p.email,
            }))
          : [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

function normalizePageInfo() {
  let rawPath = decodeURIComponent(window.location.pathname || '/');
  if (rawPath === '' || rawPath === '/index.html') {
    rawPath = '/';
  }
  if (rawPath.length > 1 && rawPath.endsWith('/')) {
    rawPath = rawPath.slice(0, -1);
  }

  let pageKey = rawPath === '/' ? 'home' : rawPath.replace(/^\//, '').replace(/\.html$/i, '');
  pageKey = pageKey
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80);
  if (!pageKey) pageKey = 'home';

  const rawTitle = (document.title || 'Hộp giấy của Etar')
    .split('—')[0]
    .split('·')[0]
    .trim();
  const pageTitle = (rawTitle || 'Trang chủ').slice(0, 80);

  return {
    pageKey,
    pageTitle,
    pagePath: rawPath.slice(0, 160),
  };
}

function hashTilt(seed) {
  const tilts = [-2.1, -1.2, 1.3, 2.0, -1.6, 0.9, -0.8, 1.7];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return tilts[hash % tilts.length];
}

function formatRelativeTime(ts) {
  if (!ts) return 'vừa xong';
  const date = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
  const diffSec = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (diffSec < 45) return 'vừa xong';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay} ngày trước`;
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function loadLocalJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveLocalJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors
  }
}

function isVerifiedOwner(user) {
  if (!user || typeof user.email !== 'string') return false;
  return OWNER_EMAILS.has(user.email.trim().toLowerCase()) && user.emailVerified === true;
}

async function initNotesDrawer() {
  if (document.getElementById('notesDrawerFab')) return;

  const pageInfo = normalizePageInfo();

  // Load Firebase config & custom emoji manifest in parallel
  let firebaseConfig = null;
  let emojiList = [];
  try {
    const [cfgRes, emojiRes] = await Promise.all([
      fetch('/firebase-applet-config.json'),
      fetch('/assets/data/emojis.json'),
    ]);
    if (!cfgRes.ok) return;
    firebaseConfig = await cfgRes.json();
    if (emojiRes.ok) {
      const parsed = await emojiRes.json();
      if (Array.isArray(parsed)) {
        emojiList = parsed.filter(
          (item) =>
            item &&
            typeof item.id === 'string' &&
            /^[a-zA-Z0-9_-]{1,40}$/.test(item.id) &&
            typeof item.src === 'string'
        );
      }
    }
  } catch (err) {
    console.error('Không thể tải cấu hình Hộp lời nhắn:', err);
    return;
  }

  const app = initializeApp(firebaseConfig);
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  auth = getAuth(app);
  testConnection();

  const emojiMap = new Map(emojiList.map((e) => [e.id, e]));

  // Local client preferences & state
  const REACTED_STORAGE_KEY = `etarbox_reacted_${pageInfo.pageKey}`;
  const NICKNAME_STORAGE_KEY = 'etarbox_note_nickname';
  const LAST_POST_KEY = 'etarbox_note_last_post_ms';

  const state = {
    isOpen: false,
    scope: 'page', // 'page' | 'all'
    composerOpen: false,
    selectedEmojiId: emojiList.length > 0 ? emojiList[0].id : '',
    selectedTone: 'mist',
    ownerSignedIn: false,
    signingIn: false,
    notes: [],
    loadingNotes: true,
    reactions: {},
    reactedSet: new Set(loadLocalJson(REACTED_STORAGE_KEY, [])),
    pendingReactions: new Set(),
    confirmDeleteId: null,
    submitting: false,
  };

  let unsubNotes = null;
  let unsubReactions = null;

  // ---------- Build Drawer & Floating Trigger DOM ----------
  document.body.classList.add('has-notes-drawer');

  const fab = document.createElement('button');
  fab.type = 'button';
  fab.id = 'notesDrawerFab';
  fab.className = 'notes-fab';
  fab.title = 'Mở Hộp lời nhắn & Thả cảm xúc';
  fab.setAttribute('aria-label', 'Mở Hộp lời nhắn và thả cảm xúc');
  fab.setAttribute('aria-expanded', 'false');
  fab.setAttribute('aria-controls', 'notesDrawer');

  const fabIcon = document.createElement('i');
  fabIcon.className = 'fas fa-sticky-note';
  fabIcon.setAttribute('aria-hidden', 'true');

  const fabCount = document.createElement('span');
  fabCount.className = 'notes-fab-count';
  fabCount.hidden = true;

  fab.appendChild(fabIcon);
  fab.appendChild(fabCount);

  const backdrop = document.createElement('div');
  backdrop.id = 'notesDrawerBackdrop';
  backdrop.className = 'notes-backdrop';

  const drawer = document.createElement('aside');
  drawer.id = 'notesDrawer';
  drawer.className = 'notes-drawer';
  drawer.setAttribute('role', 'dialog');
  drawer.setAttribute('aria-modal', 'true');
  drawer.setAttribute('aria-label', 'Hộp lời nhắn');
  drawer.innerHTML = `
    <div class="notes-drawer-header">
      <div class="notes-drawer-top">
        <div class="notes-drawer-titles">
          <h2 class="notes-drawer-title">Hộp lời nhắn</h2>
          <p class="notes-drawer-subtitle" id="notesDrawerSubtitle"></p>
        </div>
        <button type="button" class="notes-close-btn" id="notesCloseBtn" title="Đóng ngăn kéo" aria-label="Đóng ngăn kéo">
          <i class="fas fa-times" aria-hidden="true"></i>
        </button>
      </div>
      <div class="notes-scope-bar">
        <div class="notes-scope-tabs" role="tablist" aria-label="Phạm vi lời nhắn">
          <button type="button" class="notes-scope-tab is-active" data-scope="page" role="tab" aria-selected="true">Trang này</button>
          <button type="button" class="notes-scope-tab" data-scope="all" role="tab" aria-selected="false">Toàn trang</button>
        </div>
        <button type="button" class="notes-compose-toggle" id="notesComposeToggle" aria-expanded="false">
          <i class="fas fa-pen" aria-hidden="true"></i>
          <span>Viết lời nhắn</span>
        </button>
      </div>
    </div>

    <div class="notes-drawer-body">
      <section aria-label="Cảm xúc cho trang này">
        <p class="notes-section-label">Cảm xúc cho trang này</p>
        <div class="reaction-strip" id="notesReactionStrip"></div>
      </section>

      <div class="notes-composer-collapse" id="notesComposerCollapse">
        <div class="notes-composer-inner">
          <form class="notes-composer-form" id="notesComposerForm" novalidate>
            <div>
              <span class="composer-row-label">Gắn emoji lên tờ ghi chú</span>
              <div class="composer-emoji-picker" id="composerEmojiPicker"></div>
            </div>

            <div class="composer-meta-row">
              <div>
                <span class="composer-row-label">Màu giấy ghi chú</span>
                <div class="composer-tone-picker" id="composerTonePicker"></div>
              </div>
            </div>

            <div>
              <input
                type="text"
                id="noteNicknameInput"
                class="composer-input"
                maxlength="${MAX_NICKNAME_LEN}"
                placeholder="Biệt danh (để trống = Khách ghé thăm)"
                autocomplete="nickname"
              >
            </div>

            <input type="text" id="noteHoneypot" class="composer-honeypot" tabindex="-1" autocomplete="off" aria-hidden="true">

            <div>
              <textarea
                id="noteMessageInput"
                class="composer-textarea"
                maxlength="${MAX_MESSAGE_LEN}"
                placeholder="Để lại vài dòng lời nhắn ẩn danh..."
                required
              ></textarea>
            </div>

            <div class="notes-feedback" id="notesFeedback" hidden role="status" aria-live="polite"></div>

            <div class="composer-actions">
              <span class="composer-char-count" id="noteCharCount">0 / ${MAX_MESSAGE_LEN}</span>
              <button type="submit" class="composer-submit-btn" id="noteSubmitBtn">Dán lời nhắn</button>
            </div>
          </form>
        </div>
      </div>

      <section aria-label="Bảng giấy ghi chú">
        <p class="notes-section-label" id="notesBoardLabel">Giấy ghi chú trang này</p>
        <div class="notes-board" id="notesBoard"></div>
      </section>
    </div>

    <div class="notes-drawer-toast" id="notesDrawerToast" hidden role="status" aria-live="polite"></div>

    <div class="notes-drawer-footer">
      <span class="notes-footer-hint" id="notesFooterHint"></span>
      <button type="button" class="notes-auth-btn" id="notesAuthBtn" title="Đăng nhập chủ trang để quản lý lời nhắn">
        <i class="fas fa-lock" aria-hidden="true"></i>
        <span>Quản trị</span>
      </button>
    </div>
  `;

  document.body.appendChild(fab);
  document.body.appendChild(backdrop);
  document.body.appendChild(drawer);

  // DOM References
  const subtitleEl = drawer.querySelector('#notesDrawerSubtitle');
  const closeBtn = drawer.querySelector('#notesCloseBtn');
  const scopeTabs = Array.from(drawer.querySelectorAll('.notes-scope-tab'));
  const composeToggle = drawer.querySelector('#notesComposeToggle');
  const composerCollapse = drawer.querySelector('#notesComposerCollapse');
  const composerForm = drawer.querySelector('#notesComposerForm');
  const reactionStrip = drawer.querySelector('#notesReactionStrip');
  const emojiPicker = drawer.querySelector('#composerEmojiPicker');
  const tonePicker = drawer.querySelector('#composerTonePicker');
  const nicknameInput = drawer.querySelector('#noteNicknameInput');
  const honeypotInput = drawer.querySelector('#noteHoneypot');
  const messageInput = drawer.querySelector('#noteMessageInput');
  const charCountEl = drawer.querySelector('#noteCharCount');
  const submitBtn = drawer.querySelector('#noteSubmitBtn');
  const feedbackEl = drawer.querySelector('#notesFeedback');
  const drawerToastEl = drawer.querySelector('#notesDrawerToast');
  const boardLabelEl = drawer.querySelector('#notesBoardLabel');
  const boardEl = drawer.querySelector('#notesBoard');
  const footerHintEl = drawer.querySelector('#notesFooterHint');
  const authBtn = drawer.querySelector('#notesAuthBtn');

  subtitleEl.textContent = pageInfo.pageTitle;
  const savedNick = loadLocalJson(NICKNAME_STORAGE_KEY, '');
  if (typeof savedNick === 'string' && savedNick) {
    nicknameInput.value = savedNick.slice(0, MAX_NICKNAME_LEN);
  }

  let toastTimer = null;

  function showDrawerToast(text, kind) {
    clearTimeout(toastTimer);
    if (!text) {
      drawerToastEl.hidden = true;
      drawerToastEl.textContent = '';
      drawerToastEl.className = 'notes-drawer-toast';
      return;
    }
    drawerToastEl.hidden = false;
    drawerToastEl.className = `notes-drawer-toast ${kind === 'error' ? 'is-error' : 'is-success'}`;
    drawerToastEl.innerHTML = '';
    const icon = document.createElement('i');
    icon.className = kind === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';
    icon.setAttribute('aria-hidden', 'true');
    const span = document.createElement('span');
    span.textContent = text;
    drawerToastEl.appendChild(icon);
    drawerToastEl.appendChild(span);

    if (kind !== 'error') {
      toastTimer = setTimeout(() => {
        drawerToastEl.hidden = true;
      }, 4000);
    }
  }

  function showFeedback(text, kind) {
    if (!text) {
      feedbackEl.hidden = true;
      feedbackEl.textContent = '';
      feedbackEl.className = 'notes-feedback';
      return;
    }
    feedbackEl.hidden = false;
    feedbackEl.className = `notes-feedback ${kind === 'error' ? 'is-error' : 'is-success'}`;
    feedbackEl.innerHTML = '';
    const icon = document.createElement('i');
    icon.className = kind === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';
    icon.setAttribute('aria-hidden', 'true');
    const span = document.createElement('span');
    span.textContent = text;
    feedbackEl.appendChild(icon);
    feedbackEl.appendChild(span);
  }

  // ---------- Render Reaction Strip ----------
  function renderReactions() {
    reactionStrip.innerHTML = '';
    emojiList.forEach((emoji) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'reaction-btn';
      btn.dataset.emojiId = emoji.id;
      btn.title = emoji.label;
      btn.setAttribute('aria-label', `Thả cảm xúc ${emoji.label}`);

      const isReacted = state.reactedSet.has(emoji.id);
      if (isReacted) btn.classList.add('is-reacted');
      btn.setAttribute('aria-pressed', String(isReacted));

      const img = document.createElement('img');
      img.src = emoji.src;
      img.alt = emoji.label;
      img.loading = 'lazy';
      img.decoding = 'async';

      const countSpan = document.createElement('span');
      countSpan.className = 'reaction-count';
      const count = Number(state.reactions[emoji.id] || 0);
      countSpan.textContent = String(count);

      btn.appendChild(img);
      btn.appendChild(countSpan);

      btn.addEventListener('click', () => handleReactionToggle(emoji, btn));
      reactionStrip.appendChild(btn);
    });
  }

  async function handleReactionToggle(emoji, btnEl) {
    if (state.pendingReactions.has(emoji.id)) return;
    state.pendingReactions.add(emoji.id);

    const wasReacted = state.reactedSet.has(emoji.id);
    const delta = wasReacted ? -1 : 1;

    // Optimistic UI update
    const prevCount = Number(state.reactions[emoji.id] || 0);
    const nextCount = Math.max(0, prevCount + delta);
    state.reactions[emoji.id] = nextCount;
    if (wasReacted) {
      state.reactedSet.delete(emoji.id);
    } else {
      state.reactedSet.add(emoji.id);
    }
    saveLocalJson(REACTED_STORAGE_KEY, Array.from(state.reactedSet));

    // Visual pop + floating mini emoji
    btnEl.classList.toggle('is-reacted', !wasReacted);
    btnEl.setAttribute('aria-pressed', String(!wasReacted));
    const countSpan = btnEl.querySelector('.reaction-count');
    if (countSpan) countSpan.textContent = String(nextCount);

    if (!wasReacted) {
      btnEl.classList.remove('is-popping');
      void btnEl.offsetWidth;
      btnEl.classList.add('is-popping');

      const particle = document.createElement('img');
      particle.src = emoji.src;
      particle.alt = '';
      particle.className = 'reaction-float-particle';
      btnEl.appendChild(particle);
      setTimeout(() => particle.remove(), 700);
    }

    const docId = `${pageInfo.pageKey}__${emoji.id}`;
    const docPath = `page_reactions/${docId}`;
    const ref = doc(db, 'page_reactions', docId);

    try {
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists()) {
          if (delta > 0) {
            tx.set(ref, {
              pageKey: pageInfo.pageKey,
              emojiId: emoji.id,
              count: 1,
              updatedAt: serverTimestamp(),
            });
          }
        } else {
          const cur = Number(snap.data().count || 0);
          const updated = Math.max(0, cur + delta);
          if (updated !== cur) {
            tx.update(ref, {
              count: updated,
              updatedAt: serverTimestamp(),
            });
          }
        }
      });
    } catch (error) {
      // Rollback optimistic UI
      state.reactions[emoji.id] = prevCount;
      if (wasReacted) {
        state.reactedSet.add(emoji.id);
      } else {
        state.reactedSet.delete(emoji.id);
      }
      saveLocalJson(REACTED_STORAGE_KEY, Array.from(state.reactedSet));
      renderReactions();
      try {
        handleFirestoreError(error, OperationType.WRITE, docPath);
      } catch {
        // Error logged structurally
      }
    } finally {
      state.pendingReactions.delete(emoji.id);
    }
  }

  // ---------- Render Composer Pickers ----------
  function renderEmojiPicker() {
    emojiPicker.innerHTML = '';

    const noneBtn = document.createElement('button');
    noneBtn.type = 'button';
    noneBtn.className = `composer-emoji-opt is-none${state.selectedEmojiId === '' ? ' is-selected' : ''}`;
    noneBtn.textContent = 'Không gắn';
    noneBtn.addEventListener('click', () => {
      state.selectedEmojiId = '';
      renderEmojiPicker();
    });
    emojiPicker.appendChild(noneBtn);

    emojiList.forEach((emoji) => {
      const opt = document.createElement('button');
      opt.type = 'button';
      opt.className = `composer-emoji-opt${state.selectedEmojiId === emoji.id ? ' is-selected' : ''}`;
      opt.title = emoji.label;
      opt.setAttribute('aria-label', `Chọn emoji ${emoji.label}`);
      const img = document.createElement('img');
      img.src = emoji.src;
      img.alt = emoji.label;
      opt.appendChild(img);
      opt.addEventListener('click', () => {
        state.selectedEmojiId = emoji.id;
        renderEmojiPicker();
      });
      emojiPicker.appendChild(opt);
    });
  }

  function renderTonePicker() {
    tonePicker.innerHTML = '';
    VALID_TONES.forEach((tone) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `tone-swatch${state.selectedTone === tone ? ' is-selected' : ''}`;
      btn.dataset.tone = tone;
      btn.title = TONE_LABELS[tone];
      btn.setAttribute('aria-label', `Chọn màu giấy ${TONE_LABELS[tone]}`);
      btn.addEventListener('click', () => {
        state.selectedTone = tone;
        renderTonePicker();
      });
      tonePicker.appendChild(btn);
    });
  }

  // ---------- Render Sticky Notes Board ----------
  function renderBoard() {
    boardEl.innerHTML = '';

    if (state.loadingNotes) {
      const loading = document.createElement('div');
      loading.className = 'notes-loading';
      loading.textContent = 'Đang mở hộp giấy...';
      boardEl.appendChild(loading);
      return;
    }

    if (state.notes.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'notes-empty';
      empty.textContent =
        state.scope === 'page'
          ? 'Chưa có tờ ghi chú nào ở trang này. Hãy bấm "Viết lời nhắn" để dán tờ đầu tiên nhé!'
          : 'Chưa có lời nhắn nào trên toàn trang web.';
      boardEl.appendChild(empty);
      return;
    }

    const sorted = [...state.notes].sort((a, b) => {
      if (Boolean(a.pinned) !== Boolean(b.pinned)) {
        return a.pinned ? -1 : 1;
      }
      const ta = a.createdAt && typeof a.createdAt.toMillis === 'function' ? a.createdAt.toMillis() : Date.now();
      const tb = b.createdAt && typeof b.createdAt.toMillis === 'function' ? b.createdAt.toMillis() : Date.now();
      return tb - ta;
    });

    sorted.forEach((note) => {
      const card = document.createElement('article');
      card.className = `sticky-note${note.pinned ? ' is-pinned' : ''}`;
      card.dataset.tone = VALID_TONES.includes(note.paperTone) ? note.paperTone : 'mist';
      card.style.setProperty('--note-tilt', `${hashTilt(note.id)}deg`);

      const topGroup = document.createElement('div');
      topGroup.style.display = 'flex';
      topGroup.style.flexDirection = 'column';
      topGroup.style.gap = '6px';

      if (note.pinned) {
        const kicker = document.createElement('span');
        kicker.className = 'sticky-note-kicker';
        kicker.innerHTML = '<i class="fas fa-thumbtack" aria-hidden="true"></i><span>Đã ghim</span>';
        topGroup.appendChild(kicker);
      }

      const msgEl = document.createElement('p');
      msgEl.className = 'sticky-note-message';
      msgEl.textContent = note.message || '';
      topGroup.appendChild(msgEl);
      card.appendChild(topGroup);

      const bottomWrap = document.createElement('div');
      bottomWrap.style.display = 'flex';
      bottomWrap.style.flexDirection = 'column';
      bottomWrap.style.gap = '6px';

      const footer = document.createElement('div');
      footer.className = 'sticky-note-footer';

      const meta = document.createElement('div');
      meta.className = 'sticky-note-meta';

      const author = document.createElement('span');
      author.className = `sticky-note-author${note.isOwner ? ' is-owner' : ''}`;
      author.textContent = note.isOwner ? `${note.nickname || 'Etar'} · Chủ hộp giấy` : note.nickname || 'Khách ghé thăm';
      meta.appendChild(author);

      const sub = document.createElement('div');
      sub.className = 'sticky-note-sub';
      const timeEl = document.createElement('span');
      timeEl.textContent = formatRelativeTime(note.createdAt);
      sub.appendChild(timeEl);

      if (state.scope === 'all' && note.pagePath && note.pageTitle) {
        const sep = document.createElement('span');
        sep.textContent = '·';
        sep.setAttribute('aria-hidden', 'true');
        const link = document.createElement('a');
        link.className = 'sticky-note-page-link';
        link.href = note.pagePath;
        link.textContent = note.pageTitle;
        sub.appendChild(sep);
        sub.appendChild(link);
      }

      meta.appendChild(sub);
      footer.appendChild(meta);

      if (note.emojiId && emojiMap.has(note.emojiId)) {
        const em = emojiMap.get(note.emojiId);
        const img = document.createElement('img');
        img.className = 'sticky-note-emoji';
        img.src = em.src;
        img.alt = em.label;
        img.title = em.label;
        img.loading = 'lazy';
        img.decoding = 'async';
        footer.appendChild(img);
      }

      bottomWrap.appendChild(footer);

      if (state.ownerSignedIn) {
        const modBar = document.createElement('div');
        modBar.className = 'sticky-note-mod';

        const pinBtn = document.createElement('button');
        pinBtn.type = 'button';
        pinBtn.className = 'note-mod-btn';
        pinBtn.textContent = note.pinned ? 'Bỏ ghim' : 'Ghim';
        pinBtn.addEventListener('click', () => handlePinToggle(note));
        modBar.appendChild(pinBtn);

        if (state.confirmDeleteId === note.id) {
          const confirmBtn = document.createElement('button');
          confirmBtn.type = 'button';
          confirmBtn.className = 'note-mod-btn is-confirming';
          confirmBtn.textContent = 'Xác nhận xóa';
          confirmBtn.addEventListener('click', () => handleDeleteNote(note.id));

          const cancelBtn = document.createElement('button');
          cancelBtn.type = 'button';
          cancelBtn.className = 'note-mod-btn';
          cancelBtn.textContent = 'Hủy';
          cancelBtn.addEventListener('click', () => {
            state.confirmDeleteId = null;
            renderBoard();
          });

          modBar.appendChild(confirmBtn);
          modBar.appendChild(cancelBtn);
        } else {
          const delBtn = document.createElement('button');
          delBtn.type = 'button';
          delBtn.className = 'note-mod-btn is-danger';
          delBtn.textContent = 'Xóa';
          delBtn.addEventListener('click', () => {
            state.confirmDeleteId = note.id;
            renderBoard();
          });
          modBar.appendChild(delBtn);
        }

        bottomWrap.appendChild(modBar);
      }

      card.appendChild(bottomWrap);
      boardEl.appendChild(card);
    });
  }

  function updateFabBadge(count) {
    if (count > 0) {
      fabCount.textContent = count > 99 ? '99+' : String(count);
      fabCount.hidden = false;
    } else {
      fabCount.textContent = '';
      fabCount.hidden = true;
    }
  }

  // ---------- Firestore Subscriptions ----------
  function subscribeNotes() {
    if (unsubNotes) {
      unsubNotes();
      unsubNotes = null;
    }

    state.loadingNotes = true;
    renderBoard();

    const colPath = 'page_notes';
    const notesQuery =
      state.scope === 'page'
        ? query(collection(db, colPath), where('pageKey', '==', pageInfo.pageKey), limit(100))
        : query(collection(db, colPath), orderBy('createdAt', 'desc'), limit(50));

    unsubNotes = onSnapshot(
      notesQuery,
      (snapshot) => {
        state.notes = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        state.loadingNotes = false;
        if (state.scope === 'page') {
          updateFabBadge(state.notes.length);
        }
        renderBoard();
      },
      (error) => {
        state.loadingNotes = false;
        renderBoard();
        try {
          handleFirestoreError(error, OperationType.LIST, colPath);
        } catch {
          // Structured error logged
        }
      }
    );
  }

  function subscribeReactions() {
    if (unsubReactions) {
      unsubReactions();
      unsubReactions = null;
    }

    const colPath = 'page_reactions';
    const q = query(collection(db, colPath), where('pageKey', '==', pageInfo.pageKey), limit(40));

    unsubReactions = onSnapshot(
      q,
      (snapshot) => {
        const nextCounts = {};
        snapshot.docs.forEach((d) => {
          const data = d.data();
          if (data && typeof data.emojiId === 'string') {
            nextCounts[data.emojiId] = Number(data.count || 0);
          }
        });
        state.reactions = nextCounts;
        renderReactions();
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, colPath);
        } catch {
          // Structured error logged
        }
      }
    );
  }

  // ---------- Owner Moderation Handlers ----------
  async function handlePinToggle(note) {
    if (!state.ownerSignedIn) return;
    const path = `page_notes/${note.id}`;
    try {
      await updateDoc(doc(db, 'page_notes', note.id), {
        pinned: !note.pinned,
      });
      showDrawerToast(note.pinned ? 'Đã bỏ ghim lời nhắn.' : 'Đã ghim lời nhắn lên đầu bảng.', 'success');
    } catch (error) {
      showDrawerToast('Không thể cập nhật trạng thái ghim. Vui lòng thử đăng nhập lại.', 'error');
      try {
        handleFirestoreError(error, OperationType.UPDATE, path);
      } catch {
        // Logged
      }
    }
  }

  async function handleDeleteNote(noteId) {
    if (!state.ownerSignedIn) return;
    const path = `page_notes/${noteId}`;
    try {
      await deleteDoc(doc(db, 'page_notes', noteId));
      state.confirmDeleteId = null;
      showDrawerToast('Đã xóa lời nhắn.', 'success');
    } catch (error) {
      showDrawerToast('Không thể xóa lời nhắn. Vui lòng thử đăng nhập lại.', 'error');
      try {
        handleFirestoreError(error, OperationType.DELETE, path);
      } catch {
        // Logged
      }
    }
  }

  function updateAuthUI() {
    if (state.ownerSignedIn) {
      footerHintEl.textContent = 'Đang quản trị · Etar';
      authBtn.classList.add('is-signed-in');
      authBtn.disabled = false;
      authBtn.innerHTML = '<i class="fas fa-sign-out-alt" aria-hidden="true"></i><span>Đăng xuất</span>';
    } else {
      footerHintEl.textContent = '';
      authBtn.classList.remove('is-signed-in');
      authBtn.disabled = state.signingIn;
      authBtn.innerHTML = state.signingIn
        ? '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i><span>Đang đăng nhập...</span>'
        : '<i class="fas fa-lock" aria-hidden="true"></i><span>Quản trị</span>';
    }
    renderBoard();
  }

  onAuthStateChanged(auth, async (user) => {
    if (state.signingIn) return;
    if (user && !isVerifiedOwner(user)) {
      const triedEmail = user.email || 'không rõ';
      state.ownerSignedIn = false;
      updateAuthUI();
      try {
        await signOut(auth);
      } catch {
        // Ignore signOut error
      }
      if (state.isOpen) {
        showDrawerToast(`Tài khoản ${triedEmail} chưa nằm trong danh sách quản trị.`, 'error');
      }
      return;
    }
    state.ownerSignedIn = isVerifiedOwner(user);
    updateAuthUI();
  });

  authBtn.addEventListener('click', async () => {
    if (state.signingIn) return;

    if (state.ownerSignedIn) {
      try {
        await signOut(auth);
        state.ownerSignedIn = false;
        state.confirmDeleteId = null;
        updateAuthUI();
        showDrawerToast('Đã thoát chế độ quản trị.', 'success');
      } catch (err) {
        console.error('Sign out error:', err);
        showDrawerToast('Không thể đăng xuất lúc này.', 'error');
      }
      return;
    }

    state.signingIn = true;
    showDrawerToast('', 'success');
    updateAuthUI();

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      if (!isVerifiedOwner(result.user)) {
        const triedEmail = (result.user && result.user.email) || 'không rõ';
        await signOut(auth);
        state.ownerSignedIn = false;
        showDrawerToast(`Tài khoản ${triedEmail} chưa nằm trong danh sách quản trị.`, 'error');
      } else {
        state.ownerSignedIn = true;
        showDrawerToast(`Đã bật chế độ quản trị (${result.user.email}). Bạn có thể ghim, xóa hoặc dán lời nhắn chính chủ.`, 'success');
      }
    } catch (err) {
      const code = err && err.code ? err.code : '';
      if (code === 'auth/popup-blocked') {
        showDrawerToast('Trình duyệt đang chặn cửa sổ đăng nhập. Vui lòng cho phép popup rồi thử lại.', 'error');
      } else if (code === 'auth/unauthorized-domain') {
        showDrawerToast('Tên miền hiện tại chưa được cấp phép trong Firebase Auth.', 'error');
      } else if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
        showDrawerToast(`Đăng nhập chưa thành công${code ? ` (${code})` : ''}. Vui lòng thử lại.`, 'error');
      }
    } finally {
      state.signingIn = false;
      updateAuthUI();
    }
  });

  // ---------- Composer Submission ----------
  messageInput.addEventListener('input', () => {
    charCountEl.textContent = `${messageInput.value.length} / ${MAX_MESSAGE_LEN}`;
  });

  composerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (state.submitting) return;

    // Anti-bot honeypot
    if (honeypotInput.value.trim() !== '') {
      showFeedback('Không thể gửi lời nhắn.', 'error');
      return;
    }

    const message = messageInput.value.trim().slice(0, MAX_MESSAGE_LEN);
    if (!message) {
      showFeedback('Bạn hãy viết đôi dòng trước khi dán nhé.', 'error');
      messageInput.focus();
      return;
    }

    // Client-side cooldown (owner bypasses)
    if (!state.ownerSignedIn) {
      const lastPost = Number(loadLocalJson(LAST_POST_KEY, 0));
      const remainingMs = COOLDOWN_MS - (Date.now() - lastPost);
      if (remainingMs > 0) {
        const secs = Math.ceil(remainingMs / 1000);
        showFeedback(`Vui lòng chờ thêm ${secs} giây trước khi dán lời nhắn tiếp theo.`, 'error');
        return;
      }
    }

    const rawNick = nicknameInput.value.trim().slice(0, MAX_NICKNAME_LEN);
    const nickname = rawNick || (state.ownerSignedIn ? 'Etar' : 'Khách ghé thăm');
    if (rawNick) {
      saveLocalJson(NICKNAME_STORAGE_KEY, rawNick);
    }

    const safeEmojiId = emojiMap.has(state.selectedEmojiId) ? state.selectedEmojiId : '';
    const safeTone = VALID_TONES.includes(state.selectedTone) ? state.selectedTone : 'mist';

    state.submitting = true;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang dán...';
    showFeedback('', 'success');

    const payload = {
      pageKey: pageInfo.pageKey,
      pageTitle: pageInfo.pageTitle,
      pagePath: pageInfo.pagePath,
      nickname,
      message,
      emojiId: safeEmojiId,
      paperTone: safeTone,
      pinned: false,
      isOwner: state.ownerSignedIn,
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'page_notes'), payload);
      saveLocalJson(LAST_POST_KEY, Date.now());
      messageInput.value = '';
      charCountEl.textContent = `0 / ${MAX_MESSAGE_LEN}`;
      showFeedback('Đã dán tờ ghi chú của bạn lên bảng!', 'success');

      // Switch to current page view if user submitted from All Pages tab so they see their note right away
      if (state.scope !== 'page') {
        setScope('page');
      }
      setTimeout(() => {
        if (state.composerOpen) {
          setComposerOpen(false);
        }
      }, 900);
    } catch (error) {
      showFeedback('Không thể gửi lời nhắn lúc này. Vui lòng thử lại sau.', 'error');
      try {
        handleFirestoreError(error, OperationType.CREATE, 'page_notes');
      } catch {
        // Logged
      }
    } finally {
      state.submitting = false;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Dán lời nhắn';
    }
  });

  // ---------- Drawer Open / Close & Scope Tabs ----------
  function setComposerOpen(open) {
    state.composerOpen = open;
    composerCollapse.classList.toggle('is-open', open);
    composeToggle.setAttribute('aria-expanded', String(open));
    if (open) {
      showFeedback('', 'success');
      setTimeout(() => messageInput.focus(), 180);
    }
  }

  function setScope(nextScope) {
    if (state.scope === nextScope) return;
    state.scope = nextScope;
    scopeTabs.forEach((tab) => {
      const active = tab.dataset.scope === nextScope;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    boardLabelEl.textContent =
      nextScope === 'page' ? 'Giấy ghi chú trang này' : 'Lời nhắn mới nhất toàn trang';
    subscribeNotes();
  }

  function setDrawerOpen(open) {
    state.isOpen = open;
    drawer.classList.toggle('is-open', open);
    backdrop.classList.toggle('is-open', open);
    fab.setAttribute('aria-expanded', String(open));
    if (open) {
      if (!unsubNotes) subscribeNotes();
      if (!unsubReactions) subscribeReactions();
    } else {
      state.confirmDeleteId = null;
    }
  }

  fab.addEventListener('click', () => setDrawerOpen(!state.isOpen));
  closeBtn.addEventListener('click', () => setDrawerOpen(false));
  backdrop.addEventListener('click', () => setDrawerOpen(false));
  composeToggle.addEventListener('click', () => setComposerOpen(!state.composerOpen));

  scopeTabs.forEach((tab) => {
    tab.addEventListener('click', () => setScope(tab.dataset.scope));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && state.isOpen) {
      setDrawerOpen(false);
    }
  });

  // Initial static UI render + live page count listener
  renderReactions();
  renderEmojiPicker();
  renderTonePicker();
  subscribeNotes();
  subscribeReactions();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNotesDrawer);
} else {
  initNotesDrawer();
}
