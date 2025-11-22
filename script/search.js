function initSearch() {
  const searchInput = document.getElementById('searchInput');

  function getContainers() {
    return document.querySelectorAll('.container');
  }

  let containers = getContainers();

  // ✅ Xóa highlight cũ
  function clearHighlight(container) {
    container.querySelectorAll('.highlight').forEach(span => {
      span.replaceWith(span.textContent); // Gỡ span.highlight, giữ nguyên text
    });
  }

  function performSearch() {
    const searchText = searchInput.value.trim();

    // ✅ Nếu ô tìm kiếm rỗng → reload trang
    if (!searchText) {
      window.location.reload();
      return;
    }

    // Escape regex đặc biệt
    const escaped = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'giu');
    const searchLower = searchText.toLowerCase();

    containers = getContainers();

    containers.forEach(container => {
      // Xóa highlight cũ trước khi tìm mới
      clearHighlight(container);

      const fullTextLower = container.textContent.toLowerCase();

      if (fullTextLower.includes(searchLower)) {
        container.style.display = 'block';

        // ✅ TreeWalker: duyệt qua tất cả text node bên trong container
        const walker = document.createTreeWalker(
          container,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );

        let node;
        const nodesToReplace = []; // Lưu lại các node cần highlight

        while ((node = walker.nextNode())) {
          if (node.nodeValue.toLowerCase().includes(searchLower)) {
            nodesToReplace.push(node);
          }
        }

        // ✅ Sau khi duyệt xong, mới replace để tránh mất cây DOM giữa chừng
        nodesToReplace.forEach(node => {
          const text = node.nodeValue;
          const spanWrapper = document.createElement('span');
          spanWrapper.innerHTML = text.replace(regex, `<span class="highlight">$&</span>`);
          node.parentNode.replaceChild(spanWrapper, node);
        });

      } else {
        container.style.display = 'none';
      }
    });
  }

  // Gõ Enter để tìm
  searchInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      performSearch();
    }
  });
}

// Khởi tạo sau khi DOM load xong
document.addEventListener('DOMContentLoaded', function () {
  setTimeout(() => {
    initSearch();
  }, 1000);
});
