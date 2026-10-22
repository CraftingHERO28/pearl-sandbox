let animationFrameId = null;

function initV5() {
    const overlay = document.getElementById('ui-overlay');

    overlay.innerHTML = `
        <div class="absolute top-5 left-5 z-10 flex flex-col gap-2.5 pointer-events-none">
            <button id="menu-toggle" class="glass-panel px-3.5 py-2.5 rounded-xl pointer-events-auto text-xs font-medium text-slate-200 flex items-center justify-between gap-4 hover:bg-slate-800/80 transition-all shadow-lg">
                <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-pink-400 animate-pulse"></span>
                    <span class="font-semibold tracking-wide">Control Menu</span>
                </div>
                <div class="flex items-center gap-2">
                    <span id="pearl-counter" class="text-[11px] font-semibold bg-white/10 px-2 py-0.5 rounded-full text-pink-300">0 / 500</span>
                    <svg id="menu-arrow" class="w-4 h-4 transition-transform duration-300 transform rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </button>
            <div id="menu-panel" class="glass-panel p-4 rounded-xl pointer-events-auto flex flex-col gap-3.5 w-64 shadow-xl transition-all duration-300">
                <p class="text-[11px] text-slate-300 leading-relaxed">Click anywhere on the glass box to spawn pearls. Drag to rotate the 3D camera.</p>
                
                <div class="flex flex-col gap-1.5">
                    <label class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Pearl Color</label>
                    <div class="grid grid-cols-5 gap-2" id="color-picker-group">
                        <button data-color="0xffb5a7" class="w-9 h-9 rounded-lg bg-[#ffb5a7] ring-2 ring-white/50 transition-transform hover:scale-110 focus:outline-none"></button>
                        <button data-color="0x38bdf8" class="w-9 h-9 rounded-lg bg-[#38bdf8] transition-transform hover:scale-110 focus:outline-none"></button>
                        <button data-color="0x34d399" class="w-9 h-9 rounded-lg bg-[#34d399] transition-transform hover:scale-110 focus:outline-none"></button>
                        <button data-color="0xf43f5e" class="w-9 h-9 rounded-lg bg-[#f43f5e] transition-transform hover:scale-110 focus:outline-none"></button>
                        <button data-color="0xfbbf24" class="w-9 h-9 rounded-lg bg-[#fbbf24] transition-transform hover:scale-110 focus:outline-none"></button>
                    </div>
                </div>

                <button id="clear-btn" class="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/20 transition-all flex items-center justify-center gap-2">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    Clear All Pearls
                </button>
            </div>
        </div>

        <div id="gizmo-container" class="absolute top-5 right-5 z-10 w-24 h-24 pointer-events-auto rounded-xl glass-panel overflow-hidden cursor-pointer shadow-lg flex items-center justify-center hover:ring-2 hover:ring-indigo-500/50 transition-all">
            <canvas id="gizmo-canvas" class="w-full h-full"></canvas>
        </div>
    `;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 16);

    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('app-canvas'), antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dir = new THREE.DirectionalLight(0xffffff, 1.2);
    dir.position.set(10, 20, 15);
    scene.add(dir);

    const world = new CANNON.World();
    world.gravity.set(0, -12, 0);

    const boxSize = 7;
    const half = boxSize / 2;
    const wallMat = new CANNON.Material();
    const sphereMat = new CANNON.Material();
    world.addContactMaterial(new CANNON.ContactMaterial(sphereMat, wallMat, { restitution: 0.75 }));
    world.addContactMaterial(new CANNON.ContactMaterial(sphereMat, sphereMat, { restitution: 0.8 }));

    ['floor', 'ceiling', 'left', 'right', 'back', 'front'].forEach((w, i) => {
        const shape = (i<2) ? new CANNON.Box(new CANNON.Vec3(half, 0.5, half)) : (i<4)? new CANNON.Box(new CANNON.Vec3(0.5, half, half)) : new CANNON.Box(new CANNON.Vec3(half, half, 0.5));
        const body = new CANNON.Body({ mass: 0, material: wallMat, shape });
        if(i===0) body.position.set(0, -half, 0);
        if(i===1) body.position.set(0, half, 0);
        if(i===2) body.position.set(-half, 0, 0);
        if(i===3) body.position.set(half, 0, 0);
        if(i===4) body.position.set(0, 0, -half);
        if(i===5) body.position.set(0, 0, half);
        world.addBody(body);
    });

    const glassMesh = new THREE.Mesh(
        new THREE.BoxGeometry(boxSize, boxSize, boxSize),
        new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.85, opacity: 0.3, transparent: true, side: THREE.BackSide })
    );
    scene.add(glassMesh);
    scene.add(new THREE.LineSegments(new THREE.EdgesGeometry(glassMesh.geometry), new THREE.LineBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.4 })));

    const gizmoScene = new THREE.Scene();
    const gizmoCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    gizmoCamera.position.set(0, 0, 4);
    const gizmoRenderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gizmo-canvas'), antialias: true, alpha: true });
    gizmoRenderer.setSize(96, 96);
    gizmoScene.add(new THREE.AmbientLight(0xffffff, 1.0));
    const gizmoGroup = new THREE.Group();
    gizmoScene.add(gizmoGroup);

    const createTexture = (txt, bg) => {
        const c = document.createElement('canvas'); c.width = 128; c.height = 128;
        const ctx = c.getContext('2d'); ctx.fillStyle = bg; ctx.fillRect(0,0,128,128);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 44px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(txt, 64, 64);
        return new THREE.CanvasTexture(c);
    };
    const gizmoCube = new THREE.Mesh(new THREE.BoxGeometry(1.4,1.4,1.4), [
        new THREE.MeshBasicMaterial({ map: createTexture('+X', '#ef4444') }),
        new THREE.MeshBasicMaterial({ map: createTexture('-X', '#b91c1c') }),
        new THREE.MeshBasicMaterial({ map: createTexture('+Y', '#22c55e') }),
        new THREE.MeshBasicMaterial({ map: createTexture('-Y', '#15803d') }),
        new THREE.MeshBasicMaterial({ map: createTexture('+Z', '#3b82f6') }),
        new THREE.MeshBasicMaterial({ map: createTexture('-Z', '#1d4ed8') })
    ]);
    gizmoGroup.add(gizmoCube);

    const pearls = [];
    const sphereGeom = new THREE.SphereGeometry(0.32, 32, 32);
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let selectedColor = 0xffb5a7;

    const colorButtons = document.querySelectorAll('#color-picker-group button');
    colorButtons.forEach(btn => {
        if(parseInt(btn.getAttribute('data-color')) === selectedColor) {
            btn.classList.add('ring-4', 'ring-white');
        }
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            colorButtons.forEach(b => b.classList.remove('ring-4', 'ring-white'));
            btn.classList.add('ring-4', 'ring-white');
            selectedColor = parseInt(btn.getAttribute('data-color'));
        });
    });

    function createPearl(x, y, z, vx, vy, vz) {
        if(pearls.length >= 500) {
            const old = pearls.shift();
            scene.remove(old.mesh);
            world.remove(old.body);
        }
        const mesh = new THREE.Mesh(sphereGeom, new THREE.MeshPhysicalMaterial({ color: selectedColor, metalness: 0.2, roughness: 0.15, clearcoat: 1.0 }));
        scene.add(mesh);
        const body = new CANNON.Body({ mass: 0.8, material: sphereMat, shape: new CANNON.Sphere(0.32) });
        body.position.set(x, y, z);
        body.velocity.set(vx, vy, vz);
        world.addBody(body);
        pearls.push({ mesh, body });
        document.getElementById('pearl-counter').innerText = `${pearls.length} / 500`;
    }

    function onClick(e) {
        if(e.target.closest('#ui-overlay') && !e.target.closest('#menu-toggle')) return;
        if(e.target.closest('#gizmo-container')) return;

        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(glassMesh);

        if(intersects.length > 0) {
            const hit = intersects[0];
            const pt = hit.point;
            const norm = hit.face.normal;
            for(let i=0; i<20; i++) {
                createPearl(
                    Math.max(-half+0.5, Math.min(half-0.5, pt.x + (Math.random()-0.5)*0.8)),
                    Math.max(-half+0.5, Math.min(half-0.5, pt.y + (Math.random()-0.5)*0.8)),
                    Math.max(-half+0.5, Math.min(half-0.5, pt.z + (Math.random()-0.5)*0.8)),
                    -norm.x * 5 + (Math.random()-0.5)*2,
                    -norm.y * 5 + 3 + Math.random()*2,
                    -norm.z * 5 + (Math.random()-0.5)*2
                );
            }
        }
    }
    window.addEventListener('click', onClick);

    let menuOpen = true;
    document.getElementById('menu-toggle').addEventListener('click', () => {
        menuOpen = !menuOpen;
        const panel = document.getElementById('menu-panel');
        const arrow = document.getElementById('menu-arrow');
        panel.style.display = menuOpen ? 'flex' : 'none';
        arrow.style.transform = menuOpen ? 'rotate(0deg)' : 'rotate(-180deg)';
    });

    document.getElementById('clear-btn').addEventListener('click', () => {
        pearls.forEach(p => { scene.remove(p.mesh); world.remove(p.body); });
        pearls.length = 0;
        document.getElementById('pearl-counter').innerText = `0 / 500`;
    });

    document.getElementById('gizmo-container').addEventListener('click', (e) => {
        const rect = e.target.getBoundingClientRect();
        const gx = ((e.clientX - rect.left)/rect.width)*2 - 1;
        const gy = -((e.clientY - rect.top)/rect.height)*2 + 1;
        const gRay = new THREE.Raycaster();
        gRay.setFromCamera(new THREE.Vector2(gx, gy), gizmoCamera);
        const hits = gRay.intersectObject(gizmoCube);
        if(hits.length > 0) {
            const face = Math.floor(hits[0].faceIndex / 2);
            if(face===0) { rotX = Math.PI/2; rotY = 0; }
            else if(face===1) { rotX = -Math.PI/2; rotY = 0; }
            else if(face===2) { rotY = Math.PI/2-0.01; rotX = 0; }
            else if(face===3) { rotY = -Math.PI/2+0.01; rotX = 0; }
            else if(face===4) { rotX = 0; rotY = 0.3; }
            else if(face===5) { rotX = Math.PI; rotY = 0.3; }
            updateCam();
        }
    });

    let rotX = 0, rotY = 0.3, dist = 16;
    function updateCam() {
        camera.position.x = dist * Math.sin(rotX) * Math.cos(rotY);
        camera.position.y = dist * Math.sin(rotY) + 2;
        camera.position.z = dist * Math.cos(rotX) * Math.cos(rotY);
        camera.lookAt(0,0,0);
    }
    updateCam();

    let isDrag = false, prevX = 0, prevY = 0, isGizmoDrag = false;
    window.addEventListener('mousedown', (e) => {
        if(e.target.closest('#ui-overlay') && !e.target.closest('#menu-toggle')) return;
        if(e.target.closest('#gizmo-container')) {
            isGizmoDrag = true;
            prevX = e.clientX; prevY = e.clientY;
            return;
        }
        isDrag = true; prevX = e.clientX; prevY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
        if(isGizmoDrag) {
            gizmoCube.rotation.y += (e.clientX - prevX) * 0.02;
            gizmoCube.rotation.x += (e.clientY - prevY) * 0.02;
            prevX = e.clientX; prevY = e.clientY;
            return;
        }
        if(!isDrag) return;
        rotX -= (e.clientX - prevX) * 0.008;
        rotY = Math.max(-1.4, Math.min(1.4, rotY + (e.clientY - prevY) * 0.008));
        updateCam();
        prevX = e.clientX; prevY = e.clientY;
    });

    window.addEventListener('mouseup', () => { 
        isDrag = false; 
        isGizmoDrag = false;
    });

    function resize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', resize);

    for(let i=0; i<30; i++) {
        createPearl(0, -half + 1 + i*0.1, 0, (Math.random()-0.5)*2, Math.random()*2, (Math.random()-0.5)*2);
    }

    function loop() {
        world.step(1/60);
        for(let s of pearls) {
            s.mesh.position.copy(s.body.position);
            s.mesh.quaternion.copy(s.body.quaternion);
        }
        if (!isGizmoDrag) {
            gizmoGroup.quaternion.copy(camera.quaternion).invert();
        }
        gizmoRenderer.render(gizmoScene, gizmoCamera);
        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(loop);
    }
    loop();
}

window.onload = function() {
    initV5();
};