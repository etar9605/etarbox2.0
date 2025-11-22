var sortButton = document.getElementById('sortButton');
var sortCount = 0; // Biến đếm số lần người dùng click vào nút sắp xếp

sortButton.addEventListener('click', function() {
    // Lấy tất cả các container chứa thông tin
    var containers = document.querySelectorAll('.container');

    // Chuyển NodeList thành mảng để có thể sử dụng phương thức sort()
    var containerArray = Array.from(containers);

    // Tăng giá trị biến đếm lên mỗi lần click
    sortCount++;

    // Sắp xếp mảng containerArray theo tên
    containerArray.sort(function(a, b) {
        var titleA = a.querySelector('h2, h3').innerText.toLowerCase();
        var titleB = b.querySelector('h2, h3').innerText.toLowerCase();
        if (sortCount % 2 === 1) {
            // Sắp xếp theo chiều bảng chữ cái
            if (titleA < titleB) {
                return -1;
            }
            if (titleA > titleB) {
                return 1;
            }
            return 0;
        } else {
            // Sắp xếp theo ngược chiều bảng chữ cái
            if (titleA > titleB) {
                return -1;
            }
            if (titleA < titleB) {
                return 1;
            }
            return 0;
        }
    });

    // Xóa các container hiện tại
    containers.forEach(function(container) {
        container.remove();
    });

    // Tìm phần tử footer
    var footer = document.querySelector('footer');
    
    // Tạo một phần tử bao bọc trước footer để thêm các container vào
    var containerWrapper = document.createElement('div');
    containerWrapper.classList.add('container-wrapper');

    // Thêm các container đã sắp xếp lại vào phần tử bao bọc
    containerArray.forEach(function(container) {
        containerWrapper.appendChild(container);
    });

    // Thêm phần tử bao bọc vào trước footer
    footer.parentNode.insertBefore(containerWrapper, footer);
});