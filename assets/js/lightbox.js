/* ==========================================================================
   ETARBOX — Gallery Lightbox Viewer (Keyboard ← / → / Esc + Counter)
   ========================================================================== */

(function () {
  let gallerySources = [];
  let currentIndex = -1;
  let controlsInitialized = false;

  function collectSources() {
    gallerySources = Array.from(document.querySelectorAll('[data-full]'))
      .map(function (el) {
        return el.dataset.full;
      })
      .filter(Boolean);
  }

  function ensureControls(overlay) {
    if (controlsInitialized) return;
    controlsInitialized = true;

    const img = document.getElementById('overlay-img');
    if (img) {
      img.addEventListener('click', function (e) {
        e.stopPropagation();
      });
    }

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'lightbox-nav prev';
    prevBtn.setAttribute('aria-label', 'Ảnh trước');
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      stepLightbox(-1);
    });

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'lightbox-nav next';
    nextBtn.setAttribute('aria-label', 'Ảnh tiếp theo');
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      stepLightbox(1);
    });

    const counter = document.createElement('div');
    counter.id = 'lightbox-counter';
    counter.className = 'lightbox-counter';

    overlay.appendChild(prevBtn);
    overlay.appendChild(nextBtn);
    overlay.appendChild(counter);
  }

  function updateControlsVisibility() {
    const showNav = gallerySources.length > 1 && currentIndex >= 0;
    document.querySelectorAll('.lightbox-nav').forEach(function (btn) {
      btn.style.display = showNav ? 'inline-flex' : 'none';
    });
    const counter = document.getElementById('lightbox-counter');
    if (counter) {
      counter.style.display = showNav ? 'block' : 'none';
      if (showNav) {
        counter.textContent = `${currentIndex + 1} / ${gallerySources.length}`;
      }
    }
  }

  function stepLightbox(delta) {
    if (gallerySources.length <= 1) return;
    currentIndex = (currentIndex + delta + gallerySources.length) % gallerySources.length;
    const img = document.getElementById('overlay-img');
    if (img) {
      img.src = gallerySources[currentIndex];
    }
    updateControlsVisibility();
  }

  window.openOverlay = function (src) {
    const overlay = document.getElementById('overlay');
    const img = document.getElementById('overlay-img');
    if (!overlay || !img) return;

    collectSources();
    ensureControls(overlay);
    currentIndex = gallerySources.indexOf(src);

    img.src = src;
    overlay.style.display = 'flex';
    requestAnimationFrame(function () {
      overlay.classList.add('is-open');
    });
    updateControlsVisibility();
  };

  window.closeOverlay = function () {
    const overlay = document.getElementById('overlay');
    if (!overlay) return;
    overlay.classList.remove('is-open');
    setTimeout(function () {
      if (!overlay.classList.contains('is-open')) {
        overlay.style.display = 'none';
      }
    }, 240);
  };

  document.addEventListener('keydown', function (event) {
    const overlay = document.getElementById('overlay');
    if (!overlay || !overlay.classList.contains('is-open')) return;
    if (event.key === 'Escape') {
      window.closeOverlay();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      stepLightbox(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      stepLightbox(1);
    }
  });
})();
