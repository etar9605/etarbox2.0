document.addEventListener('mousemove', function(event) {
    var magicCircle = document.getElementById('magic-circle');
    // Căn chỉnh vị trí của con trỏ
    magicCircle.style.left = event.pageX + 'px';
    magicCircle.style.top = event.pageY + 'px';
});
