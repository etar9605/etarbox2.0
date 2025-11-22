// Chờ tài liệu HTML và các tài nguyên khác được tải xong
document.addEventListener("DOMContentLoaded", function() {
    // Ẩn main-content
    document.querySelector('.main-content').style.display = 'none';
    // Hiển thị intro trong một khoảng thời gian nhất định
    setTimeout(function() {
        var introContainer = document.getElementById('intro-container');
        var mainContent = document.getElementById('main-content');

        // Ẩn intro container và hiển thị nội dung chính
        introContainer.style.display = 'none';
        mainContent.style.display = 'block';
    }, 5000); // Thời gian hiển thị intro (đơn vị: mili giây), ở đây là 6000ms (tương đương 6 giây)

});
