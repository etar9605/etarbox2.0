/* ==========================================================================
   ETARBOX — Home Arcane Ritual Circle Intro (#magic-intro)
   Plays smoothly on fresh session; click / Esc skips immediately
   ========================================================================== */

(function () {
  const STORAGE_KEY = 'etarbox_magic_intro_seen';
  const RUNE_TEXT =
    'ᛏᚺᛖ ᛚᛁᚷᚺᛏ ᛁᚾ ᚲᚺᛁᛚᛞᚱᛖᚾᛋ ᛖᚤᛖᛋ ᛁᛋ ᛏᚺᛖ ᛋᛏᚨᚱᚱᛃ ᛋᚲᛃ ᚨᛏ ᛏᚺᛖ ᛖᚾᛞ ᛟᚠ ᛏᚺᛖ ᛈᚨᛏᚺ ᛟᚠ ᚱᛖᛁᚾᚲᚨᚱᚲᚨᛏᛁᛟᚾ';

  function engraveRune(selector, text, startDelay, step) {
    const textPath = document.querySelector(selector);
    if (!textPath) return;

    textPath.innerHTML = '';
    let delay = startDelay;

    for (const ch of text) {
      const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
      tspan.textContent = ch;
      tspan.classList.add('rune-char');
      tspan.style.animationDelay = `${delay}s`;
      textPath.appendChild(tspan);
      delay += ch === ' ' ? step * 2 : step;
    }
  }

  function createMagicDust(opts) {
    const dustGroup = document.getElementById('magic-dust');
    if (!dustGroup) return;

    const cx = opts.cx || 250;
    const cy = opts.cy || 250;
    const radius = opts.radius || 225;
    const count = opts.count || 36;
    const spread = opts.spread || 10;
    const delay = opts.delay || 2.2;

    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = radius + (Math.random() - 0.5) * spread;
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');

      dot.setAttribute('cx', String(cx + Math.cos(angle) * dist));
      dot.setAttribute('cy', String(cy + Math.sin(angle) * dist));
      dot.setAttribute('r', (Math.random() * 1.4 + 0.6).toFixed(2));
      dot.setAttribute('fill', Math.random() > 0.5 ? '#b694ff' : '#6ce0ff');

      const burst = 6 + Math.random() * 10;
      const curve = (Math.random() - 0.5) * 0.6;
      dot.style.setProperty('--bx', `${(Math.cos(angle + curve) * burst).toFixed(1)}px`);
      dot.style.setProperty('--by', `${(Math.sin(angle + curve) * burst).toFixed(1)}px`);
      dot.style.setProperty('--fx', `${((Math.random() - 0.5) * 8).toFixed(1)}px`);
      dot.style.setProperty('--fy', `${((Math.random() - 0.5) * 8).toFixed(1)}px`);

      dot.style.animation =
        'dust-bloom 0.75s cubic-bezier(0.22, 1, 0.36, 1) forwards, dust-float 4s ease-in-out infinite alternate, dust-blink 2.8s ease-in-out infinite';
      dot.style.animationDelay = `${(delay + Math.random() * 0.35).toFixed(2)}s`;

      frag.appendChild(dot);
    }
    dustGroup.appendChild(frag);
  }

  function initIntro() {
    const intro = document.getElementById('magic-intro');
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
    let autoHideTimer = null;

    function dismissIntro() {
      if (dismissed) return;
      dismissed = true;
      clearTimeout(autoHideTimer);
      try {
        sessionStorage.setItem(STORAGE_KEY, '1');
      } catch (_) {}
      intro.classList.add('hide');
      setTimeout(function () {
        intro.style.display = 'none';
      }, 740);
    }

    // Add discreet skip affordance
    if (!intro.querySelector('.intro-skip-hint')) {
      const skipBtn = document.createElement('button');
      skipBtn.type = 'button';
      skipBtn.className = 'intro-skip-hint';
      skipBtn.textContent = 'Nhấn bất kỳ đâu để vào thư viện';
      skipBtn.addEventListener('click', dismissIntro);
      intro.appendChild(skipBtn);
    }

    intro.addEventListener('click', dismissIntro);
    document.addEventListener('keydown', function onEsc(e) {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        dismissIntro();
        document.removeEventListener('keydown', onEsc);
      }
    });

    engraveRune('#rune-inner textPath', 'ᛊᛁᛞᛖᚱᛖ', 0.9, 0.045);
    engraveRune('#rune-outer textPath', RUNE_TEXT, 1.8, 0.011);
    createMagicDust({ radius: 225, count: 36, delay: 2.4 });

    autoHideTimer = setTimeout(dismissIntro, 3600);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIntro);
  } else {
    initIntro();
  }
})();
