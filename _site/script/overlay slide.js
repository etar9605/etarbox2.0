function openOverlay(src) {
    const overlay = document.getElementById("overlay");
    const img = document.getElementById("overlay-img");

    img.src = src;
    overlay.style.display = "flex";
}

function closeOverlay() {
    document.getElementById("overlay").style.display = "none";
}
