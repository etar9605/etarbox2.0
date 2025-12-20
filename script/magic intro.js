const RUNE_TEXT =
  "ᛏᚺᛖ ᛚᛁᚷᚺᛏ ᛁᚾ ᚲᚺᛁᛚᛞᚱᛖᚾᛋ ᛖᚤᛖᛋ ᛁᛋ ᛏᚺᛖ ᛋᛏᚨᚱᚱᛃ ᛋᚲᛃ ᚨᛏ ᛏᚺᛖ ᛖᚾᛞ ᛟᚠ ᛏᚺᛖ ᛈᚨᛏᚺ ᛟᚠ ᚱᛖᛁᚾᚲᚨᚱᚲᚨᛏᛁᛟᚾ";

window.addEventListener("load", () => {
  const textPath = document.querySelector("#rune-text textPath");

  let delay = 3; // delay after Vòng trong, Tam giác, Vòng giữa finish
  const STEP = 0.01; // tốc độ khắc từng ký tự

  [...RUNE_TEXT].forEach(char => {
    const tspan = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "tspan"
    );

    tspan.textContent = char;
    tspan.classList.add("rune-char");
    tspan.style.animationDelay = `${delay}s`;

    textPath.appendChild(tspan);

    // khoảng nghỉ nhỏ cho dấu cách
    delay += char === " " ? STEP * 2 : STEP;
  });
});

// tổng thời gian intro (vẽ + xoay chút)
const INTRO_DURATION = 4500;

window.addEventListener('load', () => {
  const intro = document.getElementById('magic-intro');

  setTimeout(() => {
    intro.classList.add('hide');

    // xoá hẳn khỏi DOM nếu muốn
    setTimeout(() => {
      intro.remove();
    }, 1200);

  }, INTRO_DURATION);
});

