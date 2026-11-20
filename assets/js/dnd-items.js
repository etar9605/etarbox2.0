/* ==========================================================================
   ETARBOX — DnD 5e Items Loader & Tag Filter
   ========================================================================== */

(function () {
  let allDndItems = [];
  let activeContainerId = 'dnd-items-container';

  function renderItems(containerId, itemsToRender) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let html = '';
    itemsToRender.forEach(function (item) {
      const descExtraHtml = item.desc_extra ? `<p>${item.desc_extra}</p>` : '';
      const tagsAttr = item.tags ? item.tags.join(',') : '';

      html += `
        <article class="item-container container divider" data-tags="${tagsAttr}">
          <div class="list" onclick="expandContainer(this)">
            <div class="icon-wrap">
              <img src="${item.image_src}" alt="${item.image_alt || item.name}" class="item-icon" loading="lazy" decoding="async">
            </div>
            <div>
              <h2>${item.name}</h2>
            </div>
          </div>

          <div class="p-divider"></div>
          <div class="item-detail-grid">
            <div>
              <p class="item-meta-line">${item.type_stats}</p>
              <div class="p-divider"></div>
              <p>${item.desc_main}</p>
            </div>
            <div class="item-detail-media">
              <img src="${item.image_src}" alt="${item.image_alt || item.name}" height="${item.image_height || 200}" class="item-image" loading="lazy" decoding="async">
            </div>
          </div>
          ${descExtraHtml}
        </article>
      `;
    });

    container.innerHTML = html;

    if (typeof window.applyPageSearch === 'function') {
      window.applyPageSearch();
    }
  }

  window.filterItems = function (selectedTag) {
    let filtered = allDndItems;
    if (selectedTag !== 'all') {
      filtered = allDndItems.filter(function (item) {
        return item.tags && item.tags.includes(selectedTag);
      });
    }

    const sorted = filtered.slice().sort(function (a, b) {
      return a.name.localeCompare(b.name, 'vi');
    });

    renderItems(activeContainerId, sorted);

    document.querySelectorAll('.filter-tag').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.tag === selectedTag);
    });
  };

  window.loadDndItems = function (containerId, dataPath) {
    activeContainerId = containerId;
    fetch(dataPath)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        allDndItems = Array.isArray(data) ? data : [];
        window.filterItems('all');
      })
      .catch(function (err) {
        console.error('Lỗi khi tải dữ liệu vật phẩm DnD:', err);
      });
  };
})();
