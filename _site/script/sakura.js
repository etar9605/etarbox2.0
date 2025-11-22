let isWindBlowing = false;

// Kích hoạt gió mạnh ngẫu nhiên
function randomWindBurst() {
    // Gió mạnh kéo dài 2s
    isWindBlowing = true;
    setTimeout(() => {
        isWindBlowing = false;
    }, 2000);

    // Lặp lại sau 5–10s
    const nextWindIn = Math.random() * 5000 + 5000;
    setTimeout(randomWindBurst, nextWindIn);
}
randomWindBurst(); // bắt đầu vòng lặp gió

setInterval(function () {
    // Xác suất xuất hiện cánh hoa (70%)
    if (Math.random() > 0.3) return;

    const petal = document.createElement('div');
    petal.classList.add('sakura-petal');
    document.body.appendChild(petal);

    // Vị trí ban đầu (ngẫu nhiên ngang theo trang)
    petal.style.left = Math.random() * window.innerWidth + 'px';
    petal.style.top = '-20px';

    // Kích thước ngẫu nhiên
    const size = Math.random() * 10 + 10;
    petal.style.width = size + 'px';
    petal.style.height = size + 'px';

    // Thời gian rơi
    const fallDuration = Math.random() * 4 + 10;
    petal.style.animationDuration = fallDuration + 's';

    // Góc xoay và bay lệch
    const initialRotate = Math.random() * 360;
    const rotateEnd = Math.random() * 360;

    // Nếu đang có gió thổi → cho offset mạnh hơn
    const offsetX = isWindBlowing
        ? (Math.random() * 300 + 150) * (Math.random() < 0.5 ? -1 : 1) // ±150–450px
        : Math.random() * 100 - 50; // bình thường: ±50px

    petal.style.setProperty('--initial-rotate', `${initialRotate}deg`);
    petal.style.setProperty('--sakura-x', `${offsetX}px`);
    petal.style.setProperty('--sakura-rotate', `${rotateEnd}deg`);

    // Cleanup
    setTimeout(() => {
        petal.remove();
    }, fallDuration * 1000 + 1000);
}, 800);
