/* ==========================================================================
   ETARBOX — Site-Wide Search (Vietnamese Diacritic-Smart + ?q= Deep Linking)
   ========================================================================== */

(function () {
  function stripDiacritics(str) {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  }

  function hasDiacritics(str) {
    const nfc = str.normalize('NFC').toLowerCase();
    return stripDiacritics(nfc) !== nfc;
  }

  function buildSearchMap(original, accentSensitive) {
    let norm = '';
    const map = [];
    for (let i = 0; i < original.length; ) {
      const cp = original.codePointAt(i);
      const ch = String.fromCodePoint(cp);
      const len = ch.length;
      const converted = accentSensitive
        ? ch.normalize('NFC').toLowerCase()
        : stripDiacritics(ch).toLowerCase();
      if (converted.length === 0) {
        if (map.length > 0) {
          map[map.length - 1].end = i + len;
        }
      } else {
        for (let j = 0; j < converted.length; j++) {
          norm += converted[j];
          map.push({ start: i, end: i + len });
        }
      }
      i += len;
    }
    return { norm, map };
  }

  function findMatchRanges(text, query) {
    const accentSensitive = hasDiacritics(query);
    const needle = accentSensitive
      ? query.normalize('NFC').toLowerCase()
      : stripDiacritics(query).toLowerCase();

    if (!needle) return [];

    const { norm, map } = buildSearchMap(text, accentSensitive);
    const ranges = [];
    let pos = 0;

    while (pos <= norm.length - needle.length) {
      const idx = norm.indexOf(needle, pos);
      if (idx === -1) break;
      const origStart = map[idx].start;
      const origEnd = map[idx + needle.length - 1].end;
      ranges.push([origStart, origEnd]);
      pos = idx + needle.length;
    }

    return ranges;
  }

  function normalizePath(pathname) {
    let p = decodeURIComponent(pathname || '/');
    if (p === '/index.html' || p === '') return '/';
    if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
    return p;
  }

  function getHideTarget(el) {
    const parent = el.parentElement;
    if (parent && parent.tagName === 'A' && parent.children.length === 1) {
      return parent;
    }
    return el;
  }

  function clearHighlights(root) {
    root.querySelectorAll('mark.highlight, span.highlight').forEach(function (mark) {
      mark.replaceWith(document.createTextNode(mark.textContent || ''));
    });
    root.normalize();
  }

  function getSearchRoot() {
    return document.querySelector('main') || document.body;
  }

  function isSkippedNode(node) {
    let cur = node.parentNode;
    while (cur && cur.nodeType === Node.ELEMENT_NODE) {
      const tag = cur.tagName;
      if (
        tag === 'SCRIPT' ||
        tag === 'STYLE' ||
        tag === 'NOSCRIPT' ||
        tag === 'TEXTAREA' ||
        tag === 'INPUT' ||
        tag === 'SELECT' ||
        tag === 'SVG'
      ) {
        return true;
      }
      if (
        cur.id === 'search-status-bar' ||
        cur.id === 'site-search-results' ||
        cur.id === 'magic-intro' ||
        cur.id === 'intro-container'
      ) {
        return true;
      }
      cur = cur.parentNode;
    }
    return false;
  }

  function createHighlightedFragment(text, ranges) {
    const frag = document.createDocumentFragment();
    let lastIndex = 0;
    ranges.forEach(function ([start, end]) {
      if (start > lastIndex) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex, start)));
      }
      const mark = document.createElement('mark');
      mark.className = 'highlight';
      mark.textContent = text.slice(start, end);
      frag.appendChild(mark);
      lastIndex = end;
    });
    if (lastIndex < text.length) {
      frag.appendChild(document.createTextNode(text.slice(lastIndex)));
    }
    return frag;
  }

  function highlightElementText(container, query, skipNestedContainers) {
    let matchCount = 0;
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (isSkippedNode(node)) return NodeFilter.FILTER_REJECT;
        if (skipNestedContainers) {
          const closestBox = node.parentElement && node.parentElement.closest('.container, .empty-box');
          if (closestBox && closestBox !== container) return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const matches = [];
    let cur;
    while ((cur = walker.nextNode())) {
      const normalized = cur.nodeValue.normalize('NFC');
      const ranges = findMatchRanges(normalized, query);
      if (ranges.length > 0) {
        matches.push({ node: cur, text: normalized, ranges });
      }
    }

    matches.forEach(function ({ node, text, ranges }) {
      matchCount += ranges.length;
      if (node.parentNode) {
        node.parentNode.replaceChild(createHighlightedFragment(text, ranges), node);
      }
    });

    return matchCount;
  }

  function restoreAutoExpanded(root) {
    root.querySelectorAll('[data-search-expanded="true"]').forEach(function (el) {
      el.classList.remove('expand', 'open', 'active');
      el.removeAttribute('data-search-expanded');
    });
  }

  function expandMatchedCollapsibles(container) {
    if (
      (container.classList.contains('item-container') ||
        container.classList.contains('monster-card')) &&
      !container.classList.contains('expand')
    ) {
      container.classList.add('expand');
      container.setAttribute('data-search-expanded', 'true');
    }

    container.querySelectorAll('.stream-wrapper').forEach(function (wrapper) {
      if (wrapper.querySelector('mark.highlight')) {
        const header = wrapper.querySelector('.accordion-header');
        const content = wrapper.querySelector('.accordion-content');
        if (content && !content.classList.contains('open')) {
          content.classList.add('open');
          content.setAttribute('data-search-expanded', 'true');
          if (header && !header.classList.contains('active')) {
            header.classList.add('active');
            header.setAttribute('data-search-expanded', 'true');
          }
        }
      }
    });
  }

  let siteIndexPromise = null;
  let siteIndexData = null;

  function loadSiteIndex() {
    if (siteIndexData) return Promise.resolve(siteIndexData);
    if (!siteIndexPromise) {
      siteIndexPromise = fetch('/search-index.json')
        .then(function (res) {
          return res.ok ? res.json() : [];
        })
        .then(function (data) {
          siteIndexData = Array.isArray(data) ? data : [];
          return siteIndexData;
        })
        .catch(function () {
          return [];
        });
    }
    return siteIndexPromise;
  }

  function extractSnippet(text, query) {
    const normalized = text.normalize('NFC');
    const ranges = findMatchRanges(normalized, query);
    if (ranges.length === 0) {
      const trimmed = normalized.slice(0, 145);
      return {
        snippet: trimmed + (normalized.length > 145 ? '…' : ''),
        ranges: [],
      };
    }

    const firstStart = ranges[0][0];
    const firstEnd = ranges[0][1];
    const windowStart = Math.max(0, firstStart - 55);
    const windowEnd = Math.min(normalized.length, firstEnd + 95);
    const prefix = windowStart > 0 ? '…' : '';
    const suffix = windowEnd < normalized.length ? '…' : '';
    const snippet = prefix + normalized.slice(windowStart, windowEnd).trim() + suffix;
    return {
      snippet,
      ranges: findMatchRanges(snippet, query),
    };
  }

  function searchSiteEntries(entries, query) {
    const currentPath = normalizePath(window.location.pathname);
    const results = [];

    for (const entry of entries) {
      if (normalizePath(entry.url) === currentPath) continue;

      const titleNorm = (entry.title || '').normalize('NFC');
      const contentNorm = (entry.content || '').normalize('NFC');
      const titleRanges = findMatchRanges(titleNorm, query);
      const contentRanges = findMatchRanges(contentNorm, query);

      if (titleRanges.length === 0 && contentRanges.length === 0) continue;

      const score = titleRanges.length * 10 + Math.min(contentRanges.length, 20);
      const snippetInfo = extractSnippet(contentNorm, query);

      results.push({
        url: entry.url,
        title: titleNorm,
        section: (entry.section || '').replace(/•/g, '·'),
        titleRanges,
        snippet: snippetInfo.snippet,
        snippetRanges: snippetInfo.ranges,
        score,
      });
    }

    results.sort(function (a, b) {
      return b.score - a.score;
    });
    return results;
  }

  function renderSiteResults(root, query, siteResults) {
    let panel = document.getElementById('site-search-results');
    if (!query || siteResults.length === 0) {
      if (panel) panel.remove();
      return;
    }

    if (!panel) {
      panel = document.createElement('section');
      panel.id = 'site-search-results';
      panel.className = 'site-search-results';
      const statusBar = document.getElementById('search-status-bar');
      if (statusBar && statusBar.parentNode === root) {
        statusBar.insertAdjacentElement('afterend', panel);
      } else {
        root.insertBefore(panel, root.firstChild);
      }
    }

    panel.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'site-search-header';
    const heading = document.createElement('h4');
    heading.textContent = `Kết quả ở các trang khác (${siteResults.length})`;
    header.appendChild(heading);
    panel.appendChild(header);

    const list = document.createElement('div');
    list.className = 'site-search-list';

    const maxVisible = 10;
    function renderItems(limit) {
      list.innerHTML = '';
      siteResults.slice(0, limit).forEach(function (item) {
        const link = document.createElement('a');
        const sep = item.url.includes('?') ? '&' : '?';
        link.href = `${item.url}${sep}q=${encodeURIComponent(query)}`;
        link.className = 'site-search-item';

        const topRow = document.createElement('div');
        topRow.className = 'site-search-item-top';

        const titleEl = document.createElement('span');
        titleEl.className = 'site-search-title';
        if (item.titleRanges.length > 0) {
          titleEl.appendChild(createHighlightedFragment(item.title, item.titleRanges));
        } else {
          titleEl.textContent = item.title;
        }
        topRow.appendChild(titleEl);

        if (item.section) {
          const meta = document.createElement('span');
          meta.className = 'site-search-meta';
          meta.textContent = item.section;
          topRow.appendChild(meta);
        }

        const snippetEl = document.createElement('p');
        snippetEl.className = 'site-search-snippet';
        if (item.snippetRanges.length > 0) {
          snippetEl.appendChild(createHighlightedFragment(item.snippet, item.snippetRanges));
        } else {
          snippetEl.textContent = item.snippet;
        }

        link.appendChild(topRow);
        link.appendChild(snippetEl);
        list.appendChild(link);
      });
    }

    renderItems(maxVisible);
    panel.appendChild(list);

    if (siteResults.length > maxVisible) {
      const moreBtn = document.createElement('button');
      moreBtn.type = 'button';
      moreBtn.className = 'site-search-more-btn';
      moreBtn.textContent = `Xem thêm ${siteResults.length - maxVisible} kết quả khác`;
      moreBtn.addEventListener('click', function () {
        renderItems(siteResults.length);
        moreBtn.remove();
      });
      panel.appendChild(moreBtn);
    }
  }

  function updateStatusBar(root, query, localBlocks, localHighlights, otherCount, onClear) {
    let bar = document.getElementById('search-status-bar');
    if (!query) {
      if (bar) bar.remove();
      return;
    }

    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'search-status-bar';
      bar.className = 'search-status-bar';
      root.insertBefore(bar, root.firstChild);
    }

    bar.innerHTML = '';
    const msg = document.createElement('span');
    if (localBlocks > 0 && otherCount > 0) {
      msg.textContent = `Trang này: ${localHighlights} từ khớp (${localBlocks} mục) · Trang khác: ${otherCount} kết quả cho "${query}"`;
    } else if (localBlocks > 0) {
      msg.textContent = `Tìm thấy ${localHighlights} từ khớp trong ${localBlocks} mục trên trang này cho "${query}"`;
    } else if (otherCount > 0) {
      msg.textContent = `Không có kết quả trên trang này · Tìm thấy ${otherCount} kết quả ở các trang khác cho "${query}"`;
    } else {
      msg.textContent = `Không tìm thấy kết quả nào trên toàn trang web cho "${query}"`;
    }

    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'search-reset-btn';
    resetBtn.textContent = 'Xóa tìm kiếm';
    resetBtn.addEventListener('click', onClear);

    bar.appendChild(msg);
    bar.appendChild(resetBtn);
  }

  function initSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput || searchInput.dataset.searchInitialized === 'true') return;
    searchInput.dataset.searchInitialized = 'true';

    searchInput.placeholder = 'Tìm gì nào...';
    searchInput.title = 'Tìm kiếm toàn trang web (nhấn / để mở nhanh)';

    const searchContainer = searchInput.closest('.search-container');
    const searchIcon = searchContainer ? searchContainer.querySelector('i.fa-search, i.fas, i.fa') : null;

    let clearBtn = null;
    if (searchContainer) {
      clearBtn = document.createElement('button');
      clearBtn.type = 'button';
      clearBtn.className = 'search-clear-btn';
      clearBtn.title = 'Xóa tìm kiếm';
      clearBtn.setAttribute('aria-label', 'Xóa tìm kiếm');
      clearBtn.textContent = '×';
      searchContainer.appendChild(clearBtn);
    }

    let activeToken = 0;

    function clearQueryParam() {
      if (window.location.search && window.history && window.history.replaceState) {
        const params = new URLSearchParams(window.location.search);
        if (params.has('q')) {
          params.delete('q');
          const qs = params.toString();
          const newUrl = window.location.pathname + (qs ? `?${qs}` : '') + window.location.hash;
          window.history.replaceState(null, '', newUrl);
        }
      }
    }

    function resetSearch() {
      activeToken++;
      const root = getSearchRoot();
      clearHighlights(root);
      restoreAutoExpanded(root);
      root.querySelectorAll('.search-hidden').forEach(function (el) {
        el.classList.remove('search-hidden');
      });
      const panel = document.getElementById('site-search-results');
      if (panel) panel.remove();
      updateStatusBar(root, '', 0, 0, 0, handleClear);
    }

    function handleClear() {
      searchInput.value = '';
      if (clearBtn) clearBtn.style.display = 'none';
      clearQueryParam();
      resetSearch();
      searchInput.focus();
    }

    function performSearch(scrollToFirst) {
      const query = searchInput.value.trim();
      const token = ++activeToken;

      if (clearBtn) clearBtn.style.display = query ? 'flex' : 'none';

      const root = getSearchRoot();
      clearHighlights(root);
      restoreAutoExpanded(root);
      root.querySelectorAll('.search-hidden').forEach(function (el) {
        el.classList.remove('search-hidden');
      });

      if (!query) {
        const panel = document.getElementById('site-search-results');
        if (panel) panel.remove();
        updateStatusBar(root, '', 0, 0, 0, handleClear);
        return;
      }

      const allBoxes = Array.from(root.querySelectorAll('.container, .empty-box')).filter(function (el) {
        return !el.closest('#magic-intro, #intro-container, #site-search-results');
      });

      let matchedBlocks = 0;
      let totalHighlights = 0;

      if (allBoxes.length === 0) {
        totalHighlights = highlightElementText(root, query, false);
        matchedBlocks = totalHighlights > 0 ? 1 : 0;
      } else {
        const leafBoxes = [];
        const parentBoxes = [];
        allBoxes.forEach(function (box) {
          if (box.querySelector('.container, .empty-box')) {
            parentBoxes.push(box);
          } else {
            leafBoxes.push(box);
          }
        });

        const matchedSet = new Set();

        leafBoxes.forEach(function (box) {
          const hits = highlightElementText(box, query, false);
          const target = getHideTarget(box);
          if (hits > 0) {
            target.classList.remove('search-hidden');
            box.classList.add('is-visible');
            matchedSet.add(box);
            matchedBlocks++;
            totalHighlights += hits;
            expandMatchedCollapsibles(box);
          } else {
            target.classList.add('search-hidden');
          }
        });

        parentBoxes.reverse().forEach(function (parentBox) {
          const ownHits = highlightElementText(parentBox, query, true);
          const descendants = Array.from(parentBox.querySelectorAll('.container, .empty-box'));
          const hasMatchedChild = descendants.some(function (child) {
            return matchedSet.has(child);
          });
          const target = getHideTarget(parentBox);

          if (ownHits > 0 || hasMatchedChild) {
            target.classList.remove('search-hidden');
            parentBox.classList.add('is-visible');
            matchedSet.add(parentBox);
            totalHighlights += ownHits;
            if (ownHits > 0 && !hasMatchedChild) {
              matchedBlocks++;
              descendants.forEach(function (child) {
                getHideTarget(child).classList.remove('search-hidden');
              });
            }
          } else {
            target.classList.add('search-hidden');
          }
        });

        root.querySelectorAll('.manuscript-sheet').forEach(function (sheet) {
          const hasVisibleSection = Array.from(sheet.children).some(function (child) {
            return (
              (child.classList.contains('container') || child.classList.contains('empty-box')) &&
              !getHideTarget(child).classList.contains('search-hidden')
            );
          });
          sheet.classList.toggle('search-hidden', !hasVisibleSection);
        });
      }

      const cachedOther = siteIndexData ? searchSiteEntries(siteIndexData, query) : [];
      updateStatusBar(root, query, matchedBlocks, totalHighlights, cachedOther.length, handleClear);
      renderSiteResults(root, query, cachedOther);

      if (!siteIndexData) {
        loadSiteIndex().then(function (entries) {
          if (token !== activeToken) return;
          const otherResults = searchSiteEntries(entries, query);
          updateStatusBar(root, query, matchedBlocks, totalHighlights, otherResults.length, handleClear);
          renderSiteResults(root, query, otherResults);
        });
      }

      if (scrollToFirst && totalHighlights > 0) {
        const firstHighlight = root.querySelector('mark.highlight');
        if (firstHighlight) {
          firstHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }

    searchInput.addEventListener(
      'focus',
      function () {
        loadSiteIndex();
      },
      { once: true }
    );

    window.applyPageSearch = function () {
      if (searchInput.value.trim()) {
        performSearch(false);
      }
    };

    let debounceTimer = null;
    searchInput.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      const val = searchInput.value.trim();
      if (clearBtn) clearBtn.style.display = val ? 'flex' : 'none';
      if (!val) {
        clearQueryParam();
        resetSearch();
        return;
      }
      debounceTimer = setTimeout(function () {
        performSearch(false);
      }, 170);
    });

    searchInput.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        clearTimeout(debounceTimer);
        performSearch(true);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        clearTimeout(debounceTimer);
        handleClear();
      }
    });

    // Press "/" anywhere outside an input to focus site-wide search
    document.addEventListener('keydown', function (event) {
      if (
        event.key === '/' &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        document.activeElement &&
        !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)
      ) {
        event.preventDefault();
        searchInput.focus();
      }
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', function (event) {
        event.preventDefault();
        clearTimeout(debounceTimer);
        handleClear();
      });
    }

    if (searchIcon) {
      searchIcon.style.cursor = 'pointer';
      searchIcon.addEventListener('click', function () {
        if (searchInput.value.trim()) {
          clearTimeout(debounceTimer);
          performSearch(true);
        } else {
          searchInput.focus();
        }
      });
    }

    const params = new URLSearchParams(window.location.search);
    const initialQuery = (params.get('q') || '').trim();
    if (initialQuery) {
      searchInput.value = initialQuery;
      performSearch(true);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
  } else {
    initSearch();
  }
})();
