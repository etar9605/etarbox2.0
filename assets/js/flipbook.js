/* ==========================================================================
   ETARBOX — Lingervox Scripts 3D Flipbook Controller
   ========================================================================== */

(function () {
  let pages = [];
  let book = null;
  let currentPage = 0;

  function updateUI() {
    if (!book || pages.length === 0) return;

    const activePage = pages[currentPage];
    if (activePage) {
      book.style.height = Math.max(540, activePage.scrollHeight) + 'px';
    }

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const indicator = document.getElementById('bookPageIndicator');

    if (prevBtn) prevBtn.disabled = currentPage <= 0;
    if (nextBtn) nextBtn.disabled = currentPage >= pages.length - 1;
    if (indicator) indicator.textContent = `Trang ${currentPage + 1} / ${pages.length}`;
  }

  window.nextPage = function () {
    if (currentPage < pages.length - 1) {
      pages[currentPage].classList.add('flipped');
      currentPage++;
      updateUI();
    }
  };

  window.prevPage = function () {
    if (currentPage > 0) {
      currentPage--;
      pages[currentPage].classList.remove('flipped');
      updateUI();
    }
  };

  function init() {
    pages = Array.from(document.querySelectorAll('.page'));
    book = document.querySelector('.book');
    if (!book || pages.length === 0) return;

    updateUI();
    window.addEventListener('resize', updateUI, { passive: true });
    document.addEventListener('keydown', function (event) {
      if (document.activeElement && /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) return;
      if (event.key === 'ArrowRight') window.nextPage();
      else if (event.key === 'ArrowLeft') window.prevPage();
    });
  }

  window.addEventListener('load', init);
})();
