/* ==========================================================================
   ETARBOX — Effects: Starlight Field (28 stars), Reactive Arcane Cursor, Magic Circle
   ========================================================================== */

(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- 1. Low-Density Ambient Starlight Field ---------- */
  function initStars() {
    if (prefersReducedMotion) return;
    const container = document.getElementById('star-container');
    if (!container || container.childElementCount > 0) return;

    const STAR_COUNT = 28;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < STAR_COUNT; i++) {
      const star = document.createElement('div');
      star.className = 'star';

      const sizeRoll = Math.random();
      if (sizeRoll < 0.35) {
        star.classList.add('star-small');
      } else if (sizeRoll < 0.78) {
        star.classList.add('star-medium');
      } else {
        star.classList.add('star-large');
      }

      star.style.left = (Math.random() * 98 + 1).toFixed(2) + 'vw';
      star.style.top = (Math.random() * 98 + 1).toFixed(2) + 'vh';

      const duration = (Math.random() * 3.2 + 2.4).toFixed(2);
      const delay = (Math.random() * 3).toFixed(2);
      star.style.animationDuration = duration + 's';
      star.style.animationDelay = delay + 's';

      fragment.appendChild(star);
    }

    container.appendChild(fragment);

    document.addEventListener('visibilitychange', function () {
      container.style.display = document.hidden ? 'none' : '';
    });
  }

  /* ---------- 2. Reactive Arcane Cursor ---------- */
  function initArcaneCursor() {
    if (!hasFinePointer) return;
    const cursor = document.getElementById('magic-cursor');
    if (!cursor) return;

    document.body.classList.add('has-magic-cursor');

    let mouseX = -100;
    let mouseY = -100;
    let rafId = 0;
    let ready = false;

    const INTERACTIVE_SELECTOR =
      'a, button, input, select, textarea, .gallery img, .item-container h2, .monster-card h2, .accordion-header, [onclick], [role="button"]';

    function renderCursor() {
      rafId = 0;
      cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    }

    document.addEventListener(
      'mousemove',
      function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!ready) {
          ready = true;
          cursor.classList.add('is-ready');
        }
        if (!rafId) {
          rafId = requestAnimationFrame(renderCursor);
        }
      },
      { passive: true }
    );

    document.addEventListener(
      'mouseover',
      function (e) {
        const interactive = e.target && e.target.closest ? e.target.closest(INTERACTIVE_SELECTOR) : null;
        cursor.classList.toggle('is-hover', Boolean(interactive));
      },
      { passive: true }
    );

    document.addEventListener(
      'mousedown',
      function () {
        cursor.classList.add('active');
      },
      { passive: true }
    );

    document.addEventListener(
      'mouseup',
      function () {
        cursor.classList.remove('active');
      },
      { passive: true }
    );

    document.addEventListener('mouseleave', function () {
      cursor.classList.remove('is-ready');
      ready = false;
    });
  }

  /* ---------- 3. Upgraded Magic Circle Hold & Click Ripple ---------- */
  function initMagicCircle() {
    if (prefersReducedMotion || !hasFinePointer) return;

    let template = null;
    let activeCircle = null;
    let circleX = 0;
    let circleY = 0;
    let rafId = 0;

    function buildTemplate() {
      const root = document.createElement('div');
      root.className = 'magic-circle-effect';

      const wrapper = document.createElement('div');
      wrapper.className = 'magic-circle-wrapper';

      ['magic-circle-core', 'magic-circle-middle', 'magic-circle-inner', 'magic-circle-inner-2'].forEach(
        function (cls) {
          const ring = document.createElement('div');
          ring.className = cls;
          wrapper.appendChild(ring);
        }
      );

      // Runic ring
      const runes = document.createElement('div');
      runes.className = 'magic-circle-runes-1';
      const runeChars =
        'ᛏᚺᛖ ᛚᛁᚷᚺᛏ ᛁᚾ ᚲᚺᛁᛚᛞᚱᛖᚾᛋ ᛖᚤᛖᛋ ᛁᛋ ᛏᚺᛖ ᛋᛏᚨᚱᚱᛃ ᛋᚲᛃ ᚨᛏ ᛏᚺᛖ ᛖᚾᛞ ᛟᚠ ᛏᚺᛖ ᛈᚨᛏᚺ ᛟᚠ ᚱᛖᛁᚾᚲᚨᚱᚲᚨᛏᛁᛟᚾ';
      for (let i = 0; i < runeChars.length; i++) {
        const span = document.createElement('span');
        span.textContent = runeChars[i];
        const angle = (360 / runeChars.length) * i;
        span.style.transform = `rotate(${angle}deg) translateY(-88px)`;
        runes.appendChild(span);
      }
      wrapper.appendChild(runes);

      // Arcane triangle
      const triangle = document.createElement('div');
      triangle.className = 'magic-triangle-wrapper';
      const radius = 58;
      const points = [];
      for (let i = 0; i < 3; i++) {
        const pt = document.createElement('div');
        pt.className = 'magic-triangle-point';
        const rad = ((i * 120 - 90) * Math.PI) / 180;
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * radius;
        pt.style.left = `calc(50% + ${x}px - 18px)`;
        pt.style.top = `calc(50% + ${y}px - 18px)`;
        triangle.appendChild(pt);
        points.push({ x, y });
      }
      [
        [0, 1],
        [1, 2],
        [2, 0],
      ].forEach(function ([a, b]) {
        const dx = points[b].x - points[a].x;
        const dy = points[b].y - points[a].y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
        const edge = document.createElement('div');
        edge.className = 'magic-triangle-edge';
        edge.style.width = `${len}px`;
        edge.style.left = `calc(50% + ${points[a].x}px)`;
        edge.style.top = `calc(50% + ${points[a].y}px)`;
        edge.style.transform = `rotate(${deg}deg)`;
        triangle.appendChild(edge);
      });
      wrapper.appendChild(triangle);

      // Petal geometry
      const flower = document.createElement('div');
      flower.className = 'magic-flower-wrapper';
      for (let i = 0; i < 3; i++) {
        const petal = document.createElement('div');
        petal.className = 'magic-flower-petal';
        const rad = ((i * 120 - 90) * Math.PI) / 180;
        petal.style.left = `calc(50% + ${Math.cos(rad) * 52}px - 14px)`;
        petal.style.top = `calc(50% + ${Math.sin(rad) * 52}px - 14px)`;
        flower.appendChild(petal);
      }
      wrapper.appendChild(flower);

      // Orbit nodes
      const orbitWrapper = document.createElement('div');
      orbitWrapper.className = 'magic-orbit-wrapper';
      points.forEach(function (pt) {
        const orbit = document.createElement('div');
        orbit.className = 'magic-orbit';
        orbit.style.left = `calc(50% + ${pt.x}px)`;
        orbit.style.top = `calc(50% + ${pt.y}px)`;
        const pivot = document.createElement('div');
        pivot.className = 'magic-orbit-pivot';
        pivot.style.left = '0px';
        pivot.style.top = '-7px';
        const dot = document.createElement('div');
        dot.className = 'magic-orbit-circle';
        pivot.appendChild(dot);
        orbit.appendChild(pivot);
        orbitWrapper.appendChild(orbit);
      });
      wrapper.appendChild(orbitWrapper);

      root.appendChild(wrapper);
      return root;
    }

    function spawnRipple(x, y) {
      const ripple = document.createElement('div');
      ripple.className = 'magic-click-ripple';
      ripple.style.setProperty('--rx', x + 'px');
      ripple.style.setProperty('--ry', y + 'px');
      document.body.appendChild(ripple);
      setTimeout(function () {
        ripple.remove();
      }, 480);
    }

    function renderCircle() {
      rafId = 0;
      if (activeCircle) {
        activeCircle.style.transform = `translate3d(${circleX}px, ${circleY}px, 0) translate(-50%, -50%)`;
      }
    }

    function onMove(e) {
      circleX = e.clientX;
      circleY = e.clientY;
      if (!rafId) {
        rafId = requestAnimationFrame(renderCircle);
      }
    }

    function dismissCircle() {
      document.removeEventListener('mousemove', onMove);
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      if (activeCircle) {
        const closing = activeCircle;
        activeCircle = null;
        closing.classList.add('is-closing');
        setTimeout(function () {
          closing.remove();
        }, 230);
      }
    }

    document.addEventListener(
      'mousedown',
      function (e) {
        if (e.button !== 0) return;
        // Skip spawning circle over text inputs so typing feels crisp
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;

        dismissCircle();
        spawnRipple(e.clientX, e.clientY);

        if (!template) {
          template = buildTemplate();
        }
        activeCircle = template.cloneNode(true);
        circleX = e.clientX;
        circleY = e.clientY;
        activeCircle.style.transform = `translate3d(${circleX}px, ${circleY}px, 0) translate(-50%, -50%)`;
        document.body.appendChild(activeCircle);

        document.addEventListener('mousemove', onMove, { passive: true });
      },
      { passive: true }
    );

    document.addEventListener('mouseup', dismissCircle, { passive: true });
    window.addEventListener('blur', dismissCircle);
  }

  function init() {
    initStars();
    initArcaneCursor();
    initMagicCircle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
