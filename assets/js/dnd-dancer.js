/* ==========================================================================
   ETARBOX — DnD Dancer Subclass Stream Accordion + Tooltips
   ========================================================================== */

(function () {
  function formatHighlight(text) {
    if (!text) return '';
    return text.replace(/\[\[(.*?)(\|(.*?))?\]\]/g, function (_, word, __, tooltip) {
      const cleanTooltip = tooltip && tooltip.trim();
      if (cleanTooltip) {
        const escaped = cleanTooltip.replace(/"/g, '&quot;');
        return `<span class="tooltip-highlight" data-tippy-content="${escaped}">${word}</span>`;
      }
      return `<strong><em>${word}</em></strong>`;
    });
  }

  window.loadStreamAccordion = function (containerId, dataPath) {
    fetch(dataPath)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        (Array.isArray(data) ? data : []).forEach(function (block, index) {
          const wrapper = document.createElement('div');
          wrapper.className = 'stream-wrapper';

          const header = document.createElement('h3');
          header.className = 'accordion-header';
          header.textContent = block.title || `Mục ${index + 1}`;
          header.setAttribute('data-index', String(index));

          const content = document.createElement('div');
          content.className = 'accordion-content';

          let bodyHtml = '';
          if (block.intro) {
            bodyHtml += `<div class="p-divider"></div><p>${formatHighlight(block.intro)}</p>`;
          }

          (block.features || []).forEach(function (feature) {
            bodyHtml += `<h4>${feature.title}</h4>`;

            if (feature.description) {
              bodyHtml += `<p>${formatHighlight(feature.description)}</p>`;
            }

            if (feature.styles && feature.styles.length > 0) {
              feature.styles.forEach(function (style) {
                bodyHtml += `<p><strong><em>${style.name}:</em></strong> ${formatHighlight(style.effect)}</p>`;
              });
            }

            if (feature.table) {
              bodyHtml += '<div class="table-scroll"><table><thead><tr>';
              (feature.table.headers || []).forEach(function (h) {
                bodyHtml += `<th>${h}</th>`;
              });
              bodyHtml += '</tr></thead><tbody>';
              (feature.table.rows || []).forEach(function (row) {
                bodyHtml += '<tr>';
                row.forEach(function (cell, cellIdx) {
                  const align = cellIdx === 1 ? ' style="text-align: left;"' : '';
                  bodyHtml += `<td${align}>${formatHighlight(cell)}</td>`;
                });
                bodyHtml += '</tr>';
              });
              bodyHtml += '</tbody></table></div>';
            }
          });

          content.innerHTML = bodyHtml;

          header.addEventListener('click', function () {
            header.classList.toggle('active');
            content.classList.toggle('open');
          });

          wrapper.appendChild(header);
          wrapper.appendChild(content);
          container.appendChild(wrapper);
        });

        if (typeof window.tippy === 'function') {
          window.tippy('.tooltip-highlight', {
            animation: 'scale',
            theme: 'light-border',
            placement: 'top',
            delay: [100, 50],
          });
        }

        if (typeof window.applyPageSearch === 'function') {
          window.applyPageSearch();
        }
      })
      .catch(function (err) {
        console.error('Lỗi khi tải dữ liệu Dancer streams:', err);
      });
  };
})();
