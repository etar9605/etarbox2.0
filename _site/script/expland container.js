function expandContainer(titleElement) {
    // 1. Tìm phần tử cha chung (.item-container)
    // titleElement là H2. itemContainer là tổ tiên gần nhất có class .item-container
    var itemContainer = titleElement.closest('.item-container');
    
    if (!itemContainer) return;
    
    // 2. Kiểm tra trạng thái hiện tại
    var isExpanded = itemContainer.classList.contains('expand');

    // 3. Xóa lớp 'expand' khỏi TẤT CẢ các container khác (Chỉ mở một)
    var containers = document.querySelectorAll('.item-container');
    containers.forEach(function(item) {
        item.classList.remove('expand');
    });

    // 4. Toggle trạng thái (Nếu chưa mở, thì mở ra)
    if (!isExpanded) {
        itemContainer.classList.add('expand');
    }
}