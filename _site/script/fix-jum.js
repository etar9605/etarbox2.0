function fixVH() {
    document.documentElement.style.setProperty('--vh', window.innerHeight * 0.01 + 'px');
}
window.addEventListener('resize', fixVH);
window.addEventListener('orientationchange', fixVH);
fixVH();
