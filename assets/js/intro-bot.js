/* ==========================================================================
   ETARBOX — Discord Bot Slash Intro (#intro-container)
   Session-aware & click/Esc skippable
   ========================================================================== */

(function () {
  const STORAGE_KEY = 'etarbox_bot_intro_seen';

  function initBotIntro() {
    const intro = document.getElementById('intro-container');
    if (!intro) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasSearchQuery = new URLSearchParams(window.location.search).has('q');
    let alreadySeen = false;
    try {
      alreadySeen = sessionStorage.getItem(STORAGE_KEY) === '1';
    } catch (_) {}

    if (reducedMotion || hasSearchQuery || alreadySeen) {
      intro.style.display = 'none';
      return;
    }

    let dismissed = false;
    let timer = null;

    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      clearTimeout(timer);
      try {
        sessionStorage.setItem(STORAGE_KEY, '1');
      } catch (_) {}
      intro.classList.add('hide');
      setTimeout(function () {
        intro.style.display = 'none';
      }, 580);
    }

    intro.addEventListener('click', dismiss);
    document.addEventListener('keydown', function onKey(e) {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        dismiss();
        document.removeEventListener('keydown', onKey);
      }
    });

    timer = setTimeout(dismiss, 3200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBotIntro);
  } else {
    initBotIntro();
  }
})();
