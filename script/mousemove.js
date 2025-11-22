document.addEventListener('mousemove', function(event) {
    var magicCursor = document.getElementById('magic-cursor');
    // Căn chỉnh vị trí của con trỏ
    magicCursor.style.left = event.pageX + 'px';
    magicCursor.style.top = event.pageY + 'px';
});

const cursor = document.querySelector('.magic-cursor');

document.addEventListener('mousedown', () => {
    cursor.classList.add('active');
});

document.addEventListener('mouseup', () => {
    cursor.classList.remove('active');
});
