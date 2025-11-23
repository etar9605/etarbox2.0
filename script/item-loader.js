/**
 * Biến toàn cục để lưu trữ tất cả dữ liệu item sau khi tải.
 * Điều này cho phép lọc mà không cần tải lại file JSON.
 */
let allDndItems = [];

/**
 * Tải dữ liệu Item từ file JSON và hiển thị chúng.
 * @param {string} containerId - ID của div chứa (ví dụ: 'dnd-items-container').
 * @param {string} dataPath - Đường dẫn đến file JSON chứa dữ liệu item (ví dụ: '/dnd/data/dnd_items.json').
 */
function loadDndItems(containerId, dataPath) {
    fetch(dataPath)
        .then(response => {
            if (!response.ok) {
                console.error(`Lỗi tải file: ${response.status} (${response.statusText}). Kiểm tra đường dẫn và Passthrough Copy.`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // LƯU DỮ LIỆU VÀO BIẾN TOÀN CỤC
            allDndItems = data;
            
            // BAN ĐẦU, HIỂN THỊ TẤT CẢ ITEM (được sắp xếp)
            filterItems('all'); // Gọi hàm lọc/sắp xếp ban đầu
        })
        .catch(error => console.error("Lỗi khi tải hoặc xử lý dữ liệu item:", error));
}

/**
 * Tạo và chèn HTML cho các item đã cho.
 * @param {string} containerId - ID của div chứa item.
 * @param {Array<Object>} itemsToRender - Mảng các item cần hiển thị.
 */
function renderItems(containerId, itemsToRender) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let allItemsHtml = '';

    itemsToRender.forEach(item => {
        const descExtraHtml = item.desc_extra ? `<p>${item.desc_extra}</p>` : '';

        allItemsHtml += `
        <div class="item-container container divider" data-tags="${item.tags ? item.tags.join(',') : ''}">
            <div class="list">
                <div>
                    <img src="${item.image_src}" alt="${item.image_alt}" height="50">
                </div>
                <div>
                    <h2 style="text-align: left;" onclick="expandContainer(this)">${item.name}</h2>
                </div>
            </div>
            <div class="p-divider"></div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 10px; text-align: center;">
                <div>
                    <p style="font-style: italic;">${item.type_stats}</p>
                    <div class="p-divider"></div>
                    <p>${item.desc_main}</p>
                </div>
                <div>
                    <img src="${item.image_src}" alt="${item.image_alt}" height="${item.image_height}">
                </div>
            </div>
            ${descExtraHtml}
        </div>
        `;
    });
    
    // Chèn tất cả HTML vào DOM một lần
    container.innerHTML = allItemsHtml;
}


/**
 * Lọc các item dựa trên tag được chọn, sắp xếp theo tên (A-Z) và hiển thị lại.
 * Hàm này được gọi từ các nút button trong item.html.
 * @param {string} selectedTag - Tag được chọn (ví dụ: 'weapon', 'magic', 'all').
 */
function filterItems(selectedTag) {
    let filteredItems = allDndItems;

    // 1. LỌC DỮ LIỆU
    if (selectedTag !== 'all') {
        filteredItems = allDndItems.filter(item => {
            return item.tags && item.tags.includes(selectedTag);
        });
    }

    // 2. SẮP XẾP THEO BẢNG CHỮ CÁI (A-Z)
    // Sắp xếp mảng đã lọc dựa trên thuộc tính 'name'
    // localeCompare() đảm bảo việc so sánh chuỗi chính xác hơn cho các ngôn ngữ khác nhau
    filteredItems.sort((a, b) => {
        return a.name.localeCompare(b.name);
    });

    // 3. HIỂN THỊ CÁC ITEM ĐÃ LỌC VÀ SẮP XẾP
    renderItems('dnd-items-container', filteredItems);

    // Cập nhật trạng thái active cho nút tag
    document.querySelectorAll('.filter-tag').forEach(button => {
        button.classList.remove('active');
    });
    // Thêm class 'active' cho nút đã click
    const activeBtn = document.querySelector(`.filter-tag[data-tag="${selectedTag}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}