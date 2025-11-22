/**
 * @param {string} containerId - ID của div chứa (ví dụ: 'dnd-items-container').
 * @param {string} dataPath - Đường dẫn đến file JSON chứa dữ liệu item.
 */
function loadDndItems(containerId, dataPath) {
    fetch(dataPath)
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById(containerId);
            if (!container) return;

            data.forEach(item => {
                // 1. Tạo container chính cho Item, giữ các class gốc
                const itemContainer = document.createElement("div");
                itemContainer.classList.add("item-container", "container", "divider");

                // 2. Tạo Header (H2) làm trigger cho Accordion
                const headerWrapper = document.createElement("div");
                const header = document.createElement("h2");
                header.classList.add("accordion-header"); // Class cho toggle
                header.style.cssText = "text-align: left;";
                header.textContent = item.name;
                headerWrapper.appendChild(header);
                itemContainer.appendChild(headerWrapper);

                // 3. Tạo Content Container (Nội dung sẽ được ẩn/hiện)
                const contentDiv = document.createElement("div");
                contentDiv.classList.add("accordion-content"); 
                
                // Thêm dải phân cách (p-divider)
                contentDiv.innerHTML += '<div class="p-divider"></div>';

                // 4. Tạo Grid chứa Stats/Mô tả và Hình ảnh
                const gridDiv = document.createElement("div");
                gridDiv.style.cssText = "display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; text-align: center;";
                
                // Cột trái: Stats và Mô tả chính
                const leftCol = document.createElement("div");
                leftCol.innerHTML = `
                    <p style="font-style: italic;">${item.type_stats}</p>
                    <div class="p-divider"></div>
                    <p>${item.desc_main}</p>
                `;
                gridDiv.appendChild(leftCol);

                // Cột phải: Hình ảnh
                const rightCol = document.createElement("div");
                rightCol.innerHTML = `
                    <img src="${item.image_src}" alt="${item.image_alt}" height="${item.image_height}">
                `;
                gridDiv.appendChild(rightCol);

                contentDiv.appendChild(gridDiv);

                // 5. Thêm Mô tả mở rộng (desc_extra) nếu có, nằm ngoài grid
                if (item.desc_extra) {
                    contentDiv.innerHTML += `<p>${item.desc_extra}</p>`;
                }
                
                // Gắn nội dung và wrapper vào container chính
                itemContainer.appendChild(contentDiv);
                container.appendChild(itemContainer);
            });

            // 6. Logic Accordion Toggle
            document.querySelectorAll(".accordion-header").forEach(header => {
                header.addEventListener("click", () => {
                    // contentDiv là nextElementSibling của headerWrapper (parent của header)
                    const content = header.parentNode.nextElementSibling; 
                    header.classList.toggle("active");
                    content.classList.toggle("open");
                });
            });
        })
        .catch(error => console.error("Lỗi khi tải dữ liệu item:", error));
}