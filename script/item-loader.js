/**
 * Tải dữ liệu Item từ file JSON và hiển thị chúng.
 * @param {string} containerId - ID của div chứa (ví dụ: 'dnd-items-container').
 * @param {string} dataPath - Đường dẫn đến file JSON chứa dữ liệu item (ví dụ: '/data/dnd_items.json').
 */
function loadDndItems(containerId, dataPath) {
    fetch(dataPath)
        .then(response => {
            if (!response.ok) {
                // Thêm thông báo lỗi rõ ràng nếu không tìm thấy file
                console.error(`Lỗi tải file: ${response.status} (${response.statusText}). Kiểm tra đường dẫn và Passthrough Copy.`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const container = document.getElementById(containerId);
            if (!container) return;

            let allItemsHtml = '';

            data.forEach(item => {
                // Xây dựng cấu trúc HTML chính xác như trong item.html
                // Chú ý: item.desc_main và item.desc_extra đã có sẵn các thẻ <br> và <span> (do |safe)
                
                const descExtraHtml = item.desc_extra ? `<p>${item.desc_extra}</p>` : '';

                allItemsHtml += `
                <div class="item-container container divider">
                    <div>
                        <h2 style="text-align: left;" onclick="expandContainer(this)">${item.name}</h2>
                    </div>
                    <div class="p-divider"></div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; text-align: center;">
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

        })
        .catch(error => console.error("Lỗi khi tải hoặc xử lý dữ liệu item:", error));
}