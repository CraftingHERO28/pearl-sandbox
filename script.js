let animationFrameId = null;

function initV1() {
    const canvas = document.getElementById('app-canvas');
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const balls = [];
    const colors = ['#ffb5a7', '#fcd5ce', '#f8edeb', '#f9dcc4', '#fec89a', '#d8e2dc'];

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);

    for(let i=0; i<30; i++) {
        balls.push({
            x: width/2 + (Math.random()-0.5)*100,
            y: height/2 + (Math.random()-0.5)*100,
            vx: (Math.random()-0.5)*4,
            vy: (Math.random()-0.5)*4,
            radius: 12,
            color: colors[Math.floor(Math.random()*colors.length)]
        });
    }

    function clickHandler(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        for(let i=0; i<15; i++) {
            balls.push({
                x: x + (Math.random()-0.5)*20,
                y: y + (Math.random()-0.5)*20,
                vx: (Math.random()-0.5)*6,
                vy: (Math.random()-0.5)*6,
                radius: 12,
                color: colors[Math.floor(Math.random()*colors.length)]
            });
        }
        if(balls.length > 150) balls.splice(0, 15);
    }
    window.addEventListener('click', clickHandler);

    function loop() {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 4;
        const boxW = Math.min(width * 0.7, 500);
        const boxH = Math.min(height * 0.7, 500);
        const boxX = (width - boxW)/2;
        const boxY = (height - boxH)/2;
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        for(let b of balls) {
            b.vy += 0.2;
            b.x += b.vx;
            b.y += b.vy;

            if(b.x - b.radius < boxX) { b.x = boxX + b.radius; b.vx *= -0.75; }
            if(b.x + b.radius > boxX + boxW) { b.x = boxX + boxW - b.radius; b.vx *= -0.75; }
            if(b.y - b.radius < boxY) { b.y = boxY + b.radius; b.vy *= -0.75; }
            if(b.y + b.radius > boxY + boxH) { b.y = boxY + boxH - b.radius; b.vy *= -0.75; b.vx *= 0.95; }

            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius, 0, Math.PI*2);
            ctx.fillStyle = b.color;
            ctx.fill();
            ctx.closePath();
        }

        animationFrameId = requestAnimationFrame(loop);
    }
    loop();
}

window.onload = function() {
    initV1();
};