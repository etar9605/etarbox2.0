/* ==========================================================================
   ETARBOX — Core UI: Active Nav, Mobile Menu, Scroll-to-Top, Responsive Tables
   ========================================================================== */

(function () {
  function highlightActiveNav() {
    const path = decodeURIComponent(window.location.pathname || '/').toLowerCase();
    let activeId = 'home';

    if (path.startsWith('/commission')) {
      activeId = 'commission';
    } else if (path.startsWith('/dnd')) {
      activeId = 'dnd';
    } else if (path.startsWith('/library')) {
      activeId = 'library';
    } else if (path.startsWith('/bot')) {
      activeId = 'bot';
    }

    const activeLink = document.getElementById(activeId);
    if (activeLink) {
      activeLink.classList.add('is-active');
      activeLink.setAttribute('aria-current', 'page');
    }
  }

  function initMobileNav() {
    const toggler = document.querySelector('.nav-toggle, [data-toggle="collapse"]');
    if (!toggler || toggler.dataset.bound === 'true') return;
    toggler.dataset.bound = 'true';

    const targetSelector = toggler.getAttribute('data-target') || '#navbar';
    const target = document.querySelector(targetSelector);
    if (!target) return;

    const icon = toggler.querySelector('i');

    function setOpen(open) {
      target.classList.toggle('show', open);
      toggler.classList.toggle('is-open', open);
      toggler.setAttribute('aria-expanded', String(open));
      if (icon) {
        icon.classList.toggle('fa-bars', !open);
        icon.classList.toggle('fa-times', open);
      }
    }

    toggler.addEventListener('click', function (event) {
      event.stopPropagation();
      setOpen(!target.classList.contains('show'));
    });

    document.addEventListener('click', function (event) {
      if (target.classList.contains('show') && !target.contains(event.target) && !toggler.contains(event.target)) {
        setOpen(false);
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && target.classList.contains('show')) {
        setOpen(false);
      }
    });
  }

  function initScrollBehavior() {
    const nav = document.querySelector('nav.site-nav');
    const topBtn = document.getElementById('scrollToTopBtn');
    let ticking = false;

    function onScrollFrame() {
      ticking = false;
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      if (nav) {
        nav.classList.toggle('is-scrolled', y > 140);
      }
      if (topBtn) {
        topBtn.classList.toggle('is-visible', y > 260);
      }
    }

    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(onScrollFrame);
        }
      },
      { passive: true }
    );

    onScrollFrame();
  }

  window.scrollToTop = function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  function wrapResponsiveTables() {
    document.querySelectorAll('main table').forEach(function (table) {
      if (table.parentElement && table.parentElement.classList.contains('table-scroll')) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'table-scroll';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });
  }

  function initCardReveal() {
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return;
    }

    const targets = Array.from(document.querySelectorAll('main > .container, main > .empty-box, main > a > .container'));
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -24px 0px', threshold: 0.04 }
    );

    targets.forEach(function (el) {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.95) {
        return; // Already in initial viewport — render immediately without hide flicker
      }
      el.classList.add('reveal-target');
      observer.observe(el);
    });
  }

  function init() {
    highlightActiveNav();
    initMobileNav();
    initScrollBehavior();
    wrapResponsiveTables();
    initCardReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
