function engraveRune(textPathSelector, text, startDelay, step) {
  const textPath = document.querySelector(textPathSelector);
  if (!textPath) return;

  let delay = startDelay;

  // xoá rune cũ nếu có (tránh bị nhân đôi khi reload)
  textPath.innerHTML = "";

  [...text].forEach(char => {
    const tspan = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "tspan"
    );

    tspan.textContent = char;
    tspan.classList.add("rune-char");
    tspan.style.animationDelay = `${delay}s`;

    textPath.appendChild(tspan);
    delay += char === " " ? step * 2 : step;
  });
}

const RUNE_TEXT =
  "ᛏᚺᛖ ᛚᛁᚷᚺᛏ ᛁᚾ ᚲᚺᛁᛚᛞᚱᛖᚾᛋ ᛖᚤᛖᛋ ᛁᛋ ᛏᚺᛖ ᛋᛏᚨᚱᚱᛃ ᛋᚲᛃ ᚨᛏ ᛏᚺᛖ ᛖᚾᛞ ᛟᚠ ᛏᚺᛖ ᛈᚨᛏᚺ ᛟᚠ ᚱᛖᛁᚾᚲᚨᚱᚲᚨᛏᛁᛟᚾ";

window.addEventListener("load", () => {

  // 🔮 Vòng rune ngoài (câu dài)
  engraveRune(
    "#rune-outer textPath",
    RUNE_TEXT,
    3,
    0.012
  );

  // ✨ Vòng rune trong (6 ký tự)
  engraveRune(
    "#rune-inner textPath",
    "ᛊᛁᛞᛖᚱᛖ",
    1.5,
    0.05
  );

});

function createMagicDust({
  cx = 250,
  cy = 250,
  radius = 190,
  count = 48,
  spread = 8,
  delay = 3.4
} = {}) {
  const dustGroup = document.getElementById('magic-dust');

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = radius + (Math.random() - 0.5) * spread;

    const x = cx + Math.cos(angle) * dist;
    const y = cy + Math.sin(angle) * dist;

    const dot = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );

    dot.setAttribute("cx", x);
    dot.setAttribute("cy", y);
    dot.setAttribute("r", Math.random() * 1.4 + 0.6);

    // 🎨 tím / xanh loang
    dot.setAttribute(
      "fill",
      Math.random() > 0.5 ? "#9b7bff" : "#6cf3ff"
    );

    /* === vector bung nổ === */
    const burst = 6 + Math.random() * 10;
    const curve = (Math.random() - 0.5) * 0.6;

    dot.style.setProperty(
      '--bx',
      `${Math.cos(angle + curve) * burst}px`
    );
    dot.style.setProperty(
      '--by',
      `${Math.sin(angle + curve) * burst}px`
    );


    /* === bay nhè nhẹ === */
    dot.style.setProperty('--fx', `${(Math.random() - 0.5) * 8}px`);
    dot.style.setProperty('--fy', `${(Math.random() - 0.5) * 8}px`);

    dot.style.animation = `
      dust-bloom 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards,
      dust-float 4s ease-in-out infinite alternate,
      dust-blink 2.8s ease-in-out infinite,
      dust-breathe 5s ease-in-out infinite,

    `;

    dot.style.animationDelay =
      `${delay + Math.random() * 0.4}s`;

    dustGroup.appendChild(dot);
  }
}

window.addEventListener("load", () => {
  createMagicDust({
    radius: 230, // sát vòng rune ngoài
    count: 42,
    delay: 4   // khớp với d6 / d7 của bạn
  });
});

const MIN_LOADING_TIME = 4500; // ms – thời gian hiển thị tối thiểu
let loadingStart = performance.now();

function showMagicLoading() {
  const intro = document.getElementById('magic-intro');
  intro.style.display = 'flex';
  intro.classList.remove('hide');
  loadingStart = performance.now();
}

function hideMagicLoading() {
  const intro = document.getElementById('magic-intro');
  const elapsed = performance.now() - loadingStart;
  const remaining = Math.max(0, MIN_LOADING_TIME - elapsed);

  setTimeout(() => {
    intro.classList.add('hide');

    setTimeout(() => {
      intro.style.display = 'none';
    }, 1000); // khớp với CSS transition
  }, remaining);
}

/* ===== SỬ DỤNG ===== */
showMagicLoading();

window.addEventListener('load', () => {
  hideMagicLoading();
});

