let magicCircle = null;

document.addEventListener('mousedown', function (e) {
    if (e.button !== 0) return;

    magicCircle = document.createElement('div');
    magicCircle.className = 'magic-circle-effect';

    const wrapper = document.createElement('div');
    wrapper.className = 'magic-circle-wrapper';

    // === Vòng tròn ===
    const core = document.createElement('div');
    core.className = 'magic-circle-core';

    const middle = document.createElement('div');
    middle.className = 'magic-circle-middle';

    const inner = document.createElement('div');
    inner.className = 'magic-circle-inner';

    const inner2 = document.createElement('div');
    inner2.className = 'magic-circle-inner-2';

    // === Vòng chữ bé ===
    const runes = document.createElement('div');
    runes.className = 'magic-circle-runes-1';
    const runeChars = 'ᛏᚺᛖ ᛚᛁᚷᚺᛏ ᛁᚾ ᚲᚺᛁᛚᛞᚱᛖᚾᛋ ᛖᚤᛖᛋ ᛁᛋ ᛏᚺᛖ ᛋᛏᚨᚱᚱᛃ ᛋᚲᛃ ᚨᛏ ᛏᚺᛖ ᛖᚾᛞ ᛟᚠ ᛏᚺᛖ ᛈᚨᛏᚺ ᛟᚠ ᚱᛖᛁᚾᚲᚨᚱᚲᚨᛏᛁᛟᚾ';
    const runeCount = runeChars.length;
    for (let i = 0; i < runeCount; i++) {
        const span = document.createElement('span');
        span.textContent = runeChars[i];
        const angle = (360 / runeCount) * i;
        span.style.transform = `rotate(${angle}deg) translateY(-90px)`;
        runes.appendChild(span);
    }

    // === Vòng chữ lớn 3D ===
    const dynamicRunes = document.createElement('div');
    dynamicRunes.className = 'magic-runes-dynamic-wrapper';
    const bigRuneChars = 'ᚠᚢᚦᚨᚱᚲ';
    bigRuneChars.split('').forEach((ch, i) => {
        const span = document.createElement('span');
        span.textContent = ch;
        span.className = 'magic-runes-dynamic';
        dynamicRunes.appendChild(span);
    });

    // === Tam giác ===
    const triangle = document.createElement('div');
    triangle.className = 'magic-triangle-wrapper';
    const triangleRadius = 60;
    const points = [];
    for (let i = 0; i < 3; i++) {
        const point = document.createElement('div');
        point.className = 'magic-triangle-point';
        const angle = (i * 120 - 90) * (Math.PI / 180);
        const x = Math.cos(angle) * triangleRadius;
        const y = Math.sin(angle) * triangleRadius;
        point.style.left = `calc(50% + ${x}px - 20px)`;
        point.style.top = `calc(50% + ${y}px - 20px)`;
        triangle.appendChild(point);
        points.push({ x, y });
    }
    // Nối các đỉnh
    const edges = [[0,1],[1,2],[2,0]];
    edges.forEach(([a,b]) => {
        const {x:x1,y:y1} = points[a];
        const {x:x2,y:y2} = points[b];
        const dx=x2-x1, dy=y2-y1;
        const length=Math.sqrt(dx*dx+dy*dy);
        const angleDeg=Math.atan2(dy,dx)*180/Math.PI;
        const edge=document.createElement('div');
        edge.className='magic-triangle-edge';
        edge.style.width=`${length}px`;
        edge.style.left=`calc(50% + ${x1}px)`;
        edge.style.top=`calc(50% + ${y1}px)`;
        edge.style.transform=`rotate(${angleDeg}deg)`;
        triangle.appendChild(edge);
    });

    // === Flower ===
    const flower = document.createElement('div');
    flower.className='magic-flower-wrapper';
    const petalRadius=55;
    for(let i=0;i<3;i++){
        const petal=document.createElement('div');
        petal.className='magic-flower-petal';
        const angle=(i*120-90)*(Math.PI/180);
        const x=Math.cos(angle)*petalRadius;
        const y=Math.sin(angle)*petalRadius;
        petal.style.left=`calc(50% + ${x}px - 15px)`;
        petal.style.top=`calc(50% + ${y}px - 15px)`;
        flower.appendChild(petal);
    }

    // === Orbit ===
    const orbitWrapper=document.createElement('div');
    orbitWrapper.className='magic-orbit-wrapper';
    points.forEach(point=>{
        const orbit=document.createElement('div');
        orbit.className='magic-orbit';
        orbit.style.left=`calc(50% + ${point.x}px)`;
        orbit.style.top=`calc(50% + ${point.y}px)`;
        const pivot=document.createElement('div');
        pivot.className='magic-orbit-pivot';
        const dx=0,dy=-8;
        pivot.style.left=`${dx}px`;
        pivot.style.top=`${dy}px`;
        const smallCircle=document.createElement('div');
        smallCircle.className='magic-orbit-circle';
        pivot.appendChild(smallCircle);
        orbit.appendChild(pivot);
        orbitWrapper.appendChild(orbit);
    });

    // === Thêm tất cả vào wrapper ===
    wrapper.appendChild(core);
    wrapper.appendChild(middle);
    wrapper.appendChild(inner);
    wrapper.appendChild(inner2);
    wrapper.appendChild(runes);

    wrapper.appendChild(triangle);
    wrapper.appendChild(flower);
    wrapper.appendChild(orbitWrapper);

    magicCircle.appendChild(wrapper);
    document.body.appendChild(magicCircle);

    updateCirclePosition(e);
    document.addEventListener('mousemove', updateCirclePosition);
});

document.addEventListener('mouseup', function () {
    if (magicCircle) {
        magicCircle.remove();
        magicCircle = null;
        document.removeEventListener('mousemove', updateCirclePosition);
    }
});

function updateCirclePosition(e) {
    if (magicCircle) {
        magicCircle.style.left = e.clientX + 'px';
        magicCircle.style.top = e.clientY + 'px';
    }
}
