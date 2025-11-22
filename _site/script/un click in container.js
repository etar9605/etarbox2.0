// Lấy tất cả các phần tử <a> trong container
var links = document.querySelectorAll('.item-container a');

// Lặp qua từng phần tử <a> và ngăn chặn sự kiện click lan ra container
links.forEach(function(link) {
    link.addEventListener('click', function(event) {
        event.stopPropagation(); // Ngăn chặn sự kiện click lan ra container
    });
});