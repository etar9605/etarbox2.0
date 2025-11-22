let magicCircle = null;

document.addEventListener('mousedown', function (e) {
    if (e.button !== 0) return;

    magicCircle = document.createElement('div');
    magicCircle.className = 'magic-circle-effect';

    const wrapper = document.createElement('div');
    wrapper.className = 'magic-circle-wrapper';

    const core = document.createElement('div');
    core.className = 'magic-circle-core';
    core.style.animation = 'appear-circle 0.5s ease-out forwards';
    core.style.animationDelay = '0s';

    const middle = document.createElement('div');
    middle.className = 'magic-circle-middle';
    middle.style.animation = 'appear-circle 0.5s ease-out forwards';
    middle.style.animationDelay = '0s';

    const inner = document.createElement('div');
    inner.className = 'magic-circle-inner';
    inner.style.animation = 'appear-circle 0.5s ease-out forwards';
    inner.style.animationDelay = '0s';

    const inner2 = document.createElement('div');
    inner2.className = 'magic-circle-inner-2';
    inner2.style.animation = 'appear-circle 0.5s ease-out forwards';
    inner2.style.animationDelay = '0s';

    const runes = document.createElement('div');
    runes.className = 'magic-circle-runes-1';

    const runeChars = 'ᛏᚺᛖ ᛚᛁᚷᚺᛏ ᛁᚾ ᚲᚺᛁᛚᛞᚱᛖᚾᛋ ᛖᚤᛖᛋ ᛁᛋ ᛏᚺᛖ ᛋᛏᚨᚱᚱᛃ ᛋᚲᛃ ᚨᛏ ᛏᚺᛖ ᛖᚾᛞ ᛟᚠ ᛏᚺᛖ ᛈᚨᛏᚺ ᛟᚠ ᚱᛖᛁᚾᚲᚨᚱᚲᚨᛏᛁᛟᚾ';
    const runeCount = runeChars.length;
    
    for (let i = 0; i < runeCount; i++) {
        const span = document.createElement('span');
        span.textContent = runeChars[i];
        const angle = (360 / runeCount) * i;
        span.style.transform = `rotate(${angle}deg) translateY(-90px)`; // giữ cho ký tự hướng tâm
        runes.appendChild(span);
    }

    const triangle = document.createElement('div');
    triangle.className = 'magic-triangle-wrapper';
    
    const triangleRadius = 60; // khoảng cách từ tâm tới các đỉnh
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

    // Nối các đỉnh bằng các cạnh
    const edges = [
        [0, 1],
        [1, 2],
        [2, 0]
    ];

    edges.forEach(([a, b]) => {
        const { x: x1, y: y1 } = points[a];
        const { x: x2, y: y2 } = points[b];

        const dx = x2 - x1;
        const dy = y2 - y1;
        let length = Math.sqrt(dx * dx + dy * dy);
        const angleDeg = Math.atan2(dy, dx) * 180 / Math.PI;
        const edge = document.createElement('div');
        edge.className = 'magic-triangle-edge';
        edge.style.width = `${length}px`;
        edge.style.left = `calc(50% + ${x1}px)`;
        edge.style.top = `calc(50% + ${y1}px)`;
        edge.style.transform = `rotate(${angleDeg}deg)`;

        triangle.appendChild(edge);
    });

        // Tính tâm tam giác (trung bình cộng 3 đỉnh)
        const center = {
            x: (points[0].x + points[1].x + points[2].x) / 3,
            y: (points[0].y + points[1].y + points[2].y) / 3
        };
    
        // Thêm đường vệ tinh (nằm giữa và thu nhỏ so với cạnh)
        edges.forEach(([a, b]) => {
            const { x: x1, y: y1 } = points[a];
            const { x: x2, y: y2 } = points[b];
    
            const mx = (x1 + x2) / 2;
            const my = (y1 + y2) / 2;
    
            // Vector từ trung điểm vào tâm
            const cx = center.x - mx;
            const cy = center.y - my;
    
            // Dịch vào trong theo vector (tùy chỉnh hệ số nếu muốn ngắn/xa)
            const shrinkFactor = 1.5;
            const vx = mx + cx * shrinkFactor;
            const vy = my + cy * shrinkFactor;
    
            // Đoạn ngắn hơn, song song cạnh gốc
            const dx = x2 - x1;
            const dy = y2 - y1;
            const angleDeg = Math.atan2(dy, dx) * 180 / Math.PI;
            const length = Math.sqrt(dx * dx + dy * dy) * 0.5; // ngắn hơn nửa
    
            const miniEdge = document.createElement('div');
            miniEdge.className = 'magic-triangle-mini-edge';
            miniEdge.style.width = `${length}px`;
            miniEdge.style.left = `calc(50% + ${vx}px)`;
            miniEdge.style.top = `calc(50% + ${vy}px)`;
            miniEdge.style.transform = `translateX(-50%) translateY(-50%) rotate(${angleDeg}deg)`;
    
            triangle.appendChild(miniEdge);
        });

        // Thêm đường vệ tinh (nằm giữa và thu nhỏ so với cạnh)
        edges.forEach(([a, b]) => {
            const { x: x1, y: y1 } = points[a];
            const { x: x2, y: y2 } = points[b];
    
            const mx = (x1 + x2) / 2;
            const my = (y1 + y2) / 2;
    
            // Vector từ trung điểm vào tâm
            const cx = center.x - mx;
            const cy = center.y - my;
    
            // Dịch vào trong theo vector (tùy chỉnh hệ số nếu muốn ngắn/xa)
            const shrinkFactor = 1.7;
            const vx = mx + cx * shrinkFactor;
            const vy = my + cy * shrinkFactor;
    
            // Đoạn ngắn hơn, song song cạnh gốc
            const dx = x2 - x1;
            const dy = y2 - y1;
            const angleDeg = Math.atan2(dy, dx) * 180 / Math.PI;
            const length = Math.sqrt(dx * dx + dy * dy) * 0.4; // ngắn hơn nửa
    
            const miniEdge = document.createElement('div');
            miniEdge.className = 'magic-triangle-mini-edge';
            miniEdge.style.width = `${length}px`;
            miniEdge.style.left = `calc(50% + ${vx}px)`;
            miniEdge.style.top = `calc(50% + ${vy}px)`;
            miniEdge.style.transform = `translateX(-50%) translateY(-50%) rotate(${angleDeg}deg)`;
    
            triangle.appendChild(miniEdge);
        });

        // Thêm đường vệ tinh ngoài (song song và lệch ra ngoài tam giác)
        edges.forEach(([a, b]) => {
            const { x: x1, y: y1 } = points[a];
            const { x: x2, y: y2 } = points[b];

            const mx = (x1 + x2) / 2;
            const my = (y1 + y2) / 2;

            // Vector từ trung điểm ra ngoài (ngược hướng với tâm)
            const cx = mx - center.x;
            const cy = my - center.y;

            // Dịch ra ngoài theo vector
            const expandFactor = 0.45; // điều chỉnh khoảng cách
            const vx = mx + cx * expandFactor;
            const vy = my + cy * expandFactor;

            // Đoạn ngắn hơn, song song cạnh gốc
            const dx = x2 - x1;
            const dy = y2 - y1;
            const angleDeg = Math.atan2(dy, dx) * 180 / Math.PI;
            const length = Math.sqrt(dx * dx + dy * dy) * 0.75; // dài nửa cạnh

            const outerEdge = document.createElement('div');
            outerEdge.className = 'magic-triangle-mini-edge-outer';
            outerEdge.style.width = `${length}px`;
            outerEdge.style.left = `calc(50% + ${vx}px)`;
            outerEdge.style.top = `calc(50% + ${vy}px)`;
            outerEdge.style.transform = `translateX(-50%) translateY(-50%) rotate(${angleDeg}deg)`;

            triangle.appendChild(outerEdge);
        });

        // Thêm đường vệ tinh ngoài (song song và lệch ra ngoài tam giác)
        edges.forEach(([a, b]) => {
            const { x: x1, y: y1 } = points[a];
            const { x: x2, y: y2 } = points[b];

            const mx = (x1 + x2) / 2;
            const my = (y1 + y2) / 2;

            // Vector từ trung điểm ra ngoài (ngược hướng với tâm)
            const cx = mx - center.x;
            const cy = my - center.y;

            // Dịch ra ngoài theo vector
            const expandFactor = 0.35; // điều chỉnh khoảng cách
            const vx = mx + cx * expandFactor;
            const vy = my + cy * expandFactor;

            // Đoạn ngắn hơn, song song cạnh gốc
            const dx = x2 - x1;
            const dy = y2 - y1;
            const angleDeg = Math.atan2(dy, dx) * 180 / Math.PI;
            const length = Math.sqrt(dx * dx + dy * dy) * 0.7;

            const outerEdge = document.createElement('div');
            outerEdge.className = 'magic-triangle-mini-edge-outer';
            outerEdge.style.width = `${length}px`;
            outerEdge.style.left = `calc(50% + ${vx}px)`;
            outerEdge.style.top = `calc(50% + ${vy}px)`;
            outerEdge.style.transform = `translateX(-50%) translateY(-50%) rotate(${angleDeg}deg)`;

            triangle.appendChild(outerEdge);
        });

    // === THÊM RUNELINE GIỮA CÁC CẠNH ===
    edges.forEach(([a, b]) => {
        const { x: x1, y: y1 } = points[a];
        const { x: x2, y: y2 } = points[b];

        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angleDeg = Math.atan2(dy, dx) * 180 / Math.PI;

        // Trung điểm cạnh
        let mx = (x1 + x2) / 2;
        let my = (y1 + y2) / 2;

        // Vector từ tâm → trung điểm
        const cx = mx - center.x;
        const cy = my - center.y;

        // Điều chỉnh khoảng cách
        const offsetFactor = 0.135; // + ra ngoài, - vào trong
        mx += cx * offsetFactor;
        my += cy * offsetFactor;

        const runeline = document.createElement('div');
        runeline.className = 'magic-runeline';
        runeline.style.left = `calc(50% + ${mx}px)`;
        runeline.style.top = `calc(50% + ${my}px)`;
        runeline.style.transform = `translateX(-50%) translateY(-50%) rotate(${angleDeg}deg)`;

        // Dòng rune cổ "StarySea" đã chuyển đổi
        const runeChars = 'ᛋᛏᚨᚱᛃᛋᛖᚨ';

        for (let i = 0; i < runeChars.length; i++) {
            const span = document.createElement('span');
            span.textContent = runeChars[i];
            span.className = 'magic-rune-char';
            runeline.appendChild(span);
        }

        triangle.appendChild(runeline);
    });

    magicCircle.appendChild(triangle);

    // === PENTAGRAM ===
    const pentagram = document.createElement('div');
    pentagram.className = 'magic-pentagram-wrapper';

    const pentaRadius = 16;
    const pentaPoints = [];

    // Tính tọa độ 5 đỉnh ngôi sao đều
    for (let i = 0; i < 5; i++) {
        const angle = (i * 72 - 90) * Math.PI / 180;
        const x = Math.cos(angle) * pentaRadius;
        const y = Math.sin(angle) * pentaRadius;
        pentaPoints.push({ x, y });
    }

    // Vẽ đường nối tạo sao (theo thứ tự nối đặc trưng của pentagram)
    const starOrder = [0, 2, 4, 1, 3, 0];

    for (let i = 0; i < starOrder.length - 1; i++) {
        const a = pentaPoints[starOrder[i]];
        const b = pentaPoints[starOrder[i + 1]];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angleDeg = Math.atan2(dy, dx) * 180 / Math.PI;

        const line = document.createElement('div');
        line.className = 'magic-pentagram-line';
        line.style.width = `${length}px`;
        line.style.left = `calc(50% + ${a.x}px)`;
        line.style.top = `calc(50% + ${a.y}px)`;
        line.style.transform = `rotate(${angleDeg}deg)`;

        pentagram.appendChild(line);
    }

    const dynamicRunes = document.createElement('div');
    dynamicRunes.className = 'magic-runes-dynamic';

    const dynamicChars = 'ᛏᚺᛖ ᛚᛁᚷᚺᛏ ᛁᚾ ᚲᚺᛁᛚᛞᚱᛖᚾᛋ ᛖᚤᛖᛋ ᛁᛋ ᛏᚺᛖ ᛋᛏᚨᚱᚱᛃ ᛋᚲᛃ ᚨᛏ ᛏᚺᛖ ᛖᚾᛞ ᛟᚠ ᛏᚺᛖ ᛈᚨᛏᚺ ᛟᚠ ᚱᛖᛁᚾᚲᚨᚱᚲᚨᛏᛁᛟᚾ';
    const runeSpeed = 6;
    const runeCircleRadius = 40;

    for (let i = 0; i < dynamicChars.length; i++) {
        const span = document.createElement('span');
        span.textContent = dynamicChars[i];

        const delay = (i / dynamicChars.length) * runeSpeed;

        span.style.animation = `moveRune ${runeSpeed}s linear infinite`;
        span.style.animationDelay = `-${delay}s`;

        dynamicRunes.appendChild(span);
    }


    // Thêm animation nếu chưa có
    const runeStyle = document.createElement('style');
    runeStyle.textContent = `
    @keyframes moveRune {
        0% { transform: rotate(0deg) translateY(-${runeCircleRadius}px) rotate(0deg); }
        100% { transform: rotate(360deg) translateY(-${runeCircleRadius}px) rotate(-360deg); }
    }
    `;
    document.head.appendChild(runeStyle);
    dynamicRunes.style.animation = 'appear-circle 0.9s ease-out forwards';
    dynamicRunes.style.animationDelay = '0s';

    const flower = document.createElement('div');
    flower.className = 'magic-flower-wrapper';

    const petalRadius = 55; // khoảng cách từ tâm ra vòng tròn nhỏ

    for (let i = 0; i < 3; i++) {
        const petal = document.createElement('div');
        petal.className = 'magic-flower-petal';

        const angle = (i * 120 - 90) * (Math.PI / 180); // 3 vòng đều nhau
        const x = Math.cos(angle) * petalRadius;
        const y = Math.sin(angle) * petalRadius;

        petal.style.left = `calc(50% + ${x}px - 15px)`; // 15 = nửa size
        petal.style.top = `calc(50% + ${y}px - 15px)`;

        flower.appendChild(petal);
    }

    // === THÊM VÒNG TRÒN TRÊN ĐỈNH TAM GIÁC ===
    const orbitWrapper = document.createElement('div');
    orbitWrapper.className = 'magic-orbit-wrapper'; // quay quanh tâm

    points.forEach((point, i) => {
        const orbit = document.createElement('div');
        orbit.className = 'magic-orbit';

        // Vị trí đỉnh tam giác
        orbit.style.left = `calc(50% + ${point.x}px)`;
        orbit.style.top = `calc(50% + ${point.y}px)`;

        // Tạo vòng bên trong để quay quanh 1 điểm trên cạnh nối đỉnh → tâm
        const pivot = document.createElement('div');
        pivot.className = 'magic-orbit-pivot';

        const angle = Math.atan2(center.y - point.y, center.x - point.x);
        const offsetDistance = 8; // khoảng cách từ đỉnh đến điểm xoay
        const offsetX = Math.cos(angle) * offsetDistance;
        const offsetY = Math.sin(angle) * offsetDistance;

        pivot.style.left = `${offsetX}px`;
        pivot.style.top = `${offsetY}px`;

        // Vòng xoay nhỏ nằm trên pivot
        const smallCircle = document.createElement('div');
        smallCircle.className = 'magic-orbit-circle';
        pivot.appendChild(smallCircle);
        orbit.appendChild(pivot);
        orbitWrapper.appendChild(orbit);
    });

    wrapper.appendChild(orbitWrapper);



    wrapper.appendChild(core);
    wrapper.appendChild(middle);
    wrapper.appendChild(pentagram);
    wrapper.appendChild(runes);
    wrapper.appendChild(dynamicRunes);
    wrapper.appendChild(inner);
    wrapper.appendChild(inner2);
    wrapper.appendChild(triangle);
    wrapper.appendChild(flower);
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
