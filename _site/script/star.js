document.addEventListener('DOMContentLoaded', function() {
    const starContainer = document.getElementById('star-container');
    const numberOfStars = 100; // Số lượng ngôi sao bạn muốn

    // Hàm tạo một ngôi sao mới
    function createStar() {
        const star = document.createElement('div');
        star.classList.add('star');

        // Chọn kích thước ngẫu nhiên
        const size = Math.random();
        if (size < 0.3) {
            star.classList.add('star-small');
        } else if (size < 0.7) {
            star.classList.add('star-medium');
        } else {
            star.classList.add('star-large');
        }

        // Đặt vị trí ngẫu nhiên trên toàn màn hình
        star.style.left = Math.random() * 100 + 'vw';
        star.style.top = Math.random() * 100 + 'vh';
        
        // Thời gian lấp lánh ngẫu nhiên
        const animationDuration = Math.random() * 3 + 2; // Từ 2 đến 5 giây
        const animationDelay = Math.random() * 2; // Trì hoãn ngẫu nhiên để không lấp lánh cùng lúc

        // Áp dụng animation CSS cho hiệu ứng lấp lánh
        star.style.animation = `fadeAndGlow ${animationDuration}s ${animationDelay}s infinite alternate`;
        
        starContainer.appendChild(star);
    }

    // Tạo các ngôi sao ban đầu
    for (let i = 0; i < numberOfStars; i++) {
        createStar();
    }
});
