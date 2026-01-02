            const pages = document.querySelectorAll('.page');
            const book = document.querySelector('.book');
            let currentPage = 0;

            function resizeBook() {
                const page = pages[currentPage];
                book.style.height = page.scrollHeight + "px";
            }

            function nextPage() {
                if (currentPage < pages.length) {
                    pages[currentPage].classList.add('flipped');
                    currentPage++;
                    resizeBook();
                }
            }

            function prevPage() {
                if (currentPage > 0) {
                    currentPage--;
                    pages[currentPage].classList.remove('flipped');
                    resizeBook();
                }
            }

            // gọi lúc load trang
            window.addEventListener("load", resizeBook);