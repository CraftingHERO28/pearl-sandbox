let animId,world,scene,camera,renderer,glassMesh,wireMesh,walls=[];
let pearls=[];
let boxSize=7,maxPerls=500,perClick=20,selectedColor=0xffb5a7;
let rotX=0,rotY=0.3,camDist=16;
let isDragging=false,isGizmoDrag=false,prevX=0,prevY=0;
let dummyVarForNothing = 42;
let anotherUselessArray = [1,2,3,4,5,6,7,8,9,10];

window.onload = function() {
    let overlay = document.getElementById('ui-overlay');
    overlay.innerHTML = `
        <div style="position:absolute;top:20px;left:20px;z-index:10;pointer-events:none;display:flex;flex-direction:column;gap:10px;">
            <button id="menu-toggle" class="glass-panel" style="padding:10px 14px;border-radius:12px;pointer-events:auto;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:15px;color:#e2e8f0;font-size:12px;font-weight:600;">
                <span style="display:flex;align-items:center;gap:8px;"><span style="width:10px;height:10px;border-radius:50%;background:#f43f5e;"></span>Control Panel</span>
                <span id="counter" style="background:rgba(255,255,255,0.1);padding:2px 8px;border-radius:99px;color:#fbcfe8;font-size:11px;">0 / 500</span>
            </button>
            <div id="menu-box" class="glass-panel" style="padding:15px;border-radius:12px;pointer-events:auto;display:flex;flex-direction:column;gap:12px;width:240px;">
                <div style="display:flex;flex-direction:column;gap:4px;">
                    <label style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;">Box Size: <span id="val-box">7</span></label>
                    <input type="range" id="slider-box" min="4" max="12" step="0.5" value="7">
                </div>
                <div style="display:flex;flex-direction:column;gap:4px;">
                    <label style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;">Pearls / Click: <span id="val-click">20</span></label>
                    <input type="range" id="slider-click" min="1" max="50" value="20">
                </div>
                <div style="display:flex;flex-direction:column;gap:4px;">
                    <label style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;">Max Pearls: <span id="val-max">500</span></label>
                    <input type="range" id="slider-max" min="50" max="1000" step="50" value="500">
                </div>
                <div style="display:flex;flex-direction:column;gap:4px;">
                    <label style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;">Color</label>
                    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;" id="colors">
                        <button data-c="0xffb5a7" style="height:28px;border-radius:6px;background:#ffb5a7;border:2px solid #fff;cursor:pointer;"></button>
                        <button data-c="0x38bdf8" style="height:28px;border-radius:6px;background:#38bdf8;border:2px solid transparent;cursor:pointer;"></button>
                        <button data-c="0x34d399" style="height:28px;border-radius:6px;background:#34d399;border:2px solid transparent;cursor:pointer;"></button>
                        <button data-c="0xf43f5e" style="height:28px;border-radius:6px;background:#f43f5e;border:2px solid transparent;cursor:pointer;"></button>
                        <button data-c="0xfbbf24" style="height:28px;border-radius:6px;background:#fbbf24;border:2px solid transparent;cursor:pointer;"></button>
                    </div>
                </div>
                <button id="btn-clear" style="padding:8px;border-radius:8px;background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.3);color:#fca5a5;font-size:11px;font-weight:600;cursor:pointer;">Clear All</button>
            </div>
        </div>
        <div id="gizmo-container" class="glass-panel" style="position:absolute;top:20px;right:20px;z-index:10;width:90px;height:90px;border-radius:12px;pointer-events:auto;cursor:pointer;overflow:hidden;">
            <canvas id="gizmo-canvas" style="width:100%;height:100%;display:block;"></canvas>
        </div>
    `;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('app-canvas'), antialias:true, alpha:true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    let dLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dLight.position.set(10,20,15);
    scene.add(dLight);

    world = new CANNON.World();
    world.gravity.set(0, -12, 0);

    buildBox(boxSize);
    updateCam();

    let gScene = new THREE.Scene();
    let gCam = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    gCam.position.set(0,0,4);
    let gRenderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gizmo-canvas'), antialias:true, alpha:true });
    gRenderer.setSize(90, 90);
    gScene.add(new THREE.AmbientLight(0xffffff, 1.0));
    let gGroup = new THREE.Group();
    gScene.add(gGroup);

    function mkTex(txt, bg) {
        let c = document.createElement('canvas'); c.width = c.height = 128;
        let ctx = c.getContext('2d'); ctx.fillStyle = bg; ctx.fillRect(0,0,128,128);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 44px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(txt, 64, 64);
        return new THREE.CanvasTexture(c);
    }

    let gCube = new THREE.Mesh(new THREE.BoxGeometry(1.4,1.4,1.4), [
        new THREE.MeshBasicMaterial({map: mkTex('+X', '#ef4444')}),
        new THREE.MeshBasicMaterial({map: mkTex('-X', '#b91c1c')}),
        new THREE.MeshBasicMaterial({map: mkTex('+Y', '#22c55e')}),
        new THREE.MeshBasicMaterial({map: mkTex('-Y', '#15803d')}),
        new THREE.MeshBasicMaterial({map: mkTex('+Z', '#3b82f6')}),
        new THREE.MeshBasicMaterial({map: mkTex('-Z', '#1d4ed8')})
    ]);
    gGroup.add(gCube);

    let menuOpen = true;
    document.getElementById('menu-toggle').onclick = function() {
        menuOpen = !menuOpen;
        document.getElementById('menu-box').style.display = menuOpen ? 'flex' : 'none';
    };

    document.getElementById('btn-clear').onclick = function() {
        for(let i=0; i<pearls.length; i++) {
            scene.remove(pearls[i].mesh);
            world.remove(pearls[i].body);
        }
        pearls = [];
        updateCounter();
    };

    document.getElementById('slider-box').oninput = function(e) {
        boxSize = parseFloat(e.target.value);
        document.getElementById('val-box').innerText = boxSize;
        buildBox(boxSize);
    };

    document.getElementById('slider-click').oninput = function(e) {
        perClick = parseInt(e.target.value);
        document.getElementById('val-click').innerText = perClick;
    };

    document.getElementById('slider-max').oninput = function(e) {
        maxPerls = parseInt(e.target.value);
        document.getElementById('val-max').innerText = maxPerls;
    };

    let colBtns = document.querySelectorAll('#colors button');
    for(let i=0; i<colBtns.length; i++) {
        colBtns[i].onclick = function(e) {
            e.stopPropagation();
            for(let j=0; j<colBtns.length; j++) colBtns[j].style.border = '2px solid transparent';
            this.style.border = '2px solid #fff';
            selectedColor = parseInt(this.getAttribute('data-c'));
        };
    }

    window.onresize = function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.onmousedown = function(e) {
        if(e.target.closest('#ui-overlay') && !e.target.closest('#menu-toggle')) return;
        if(e.target.closest('#gizmo-container')) {
            isGizmoDrag = true;
            prevX = e.clientX; prevY = e.clientY;
            return;
        }
        isDragging = true; prevX = e.clientX; prevY = e.clientY;
    };

    window.onmousemove = function(e) {
        if(isGizmoDrag) {
            gCube.rotation.y += (e.clientX - prevX) * 0.02;
            gCube.rotation.x += (e.clientY - prevY) * 0.02;
            prevX = e.clientX; prevY = e.clientY;
            return;
        }
        if(!isDragging) return;
        rotX -= (e.clientX - prevX) * 0.008;
        rotY = Math.max(-1.4, Math.min(1.4, rotY + (e.clientY - prevY) * 0.008));
        updateCam();
        prevX = e.clientX; prevY = e.clientY;
    };

    window.onmouseup = function() {
        isDragging = false;
        isGizmoDrag = false;
    };

    document.getElementById('gizmo-container').onclick = function(e) {
        if(isGizmoDrag) return;
        let rect = this.getBoundingClientRect();
        let gx = ((e.clientX - rect.left)/rect.width)*2 - 1;
        let gy = -((e.clientY - rect.top)/rect.height)*2 + 1;
        let ray = new THREE.Raycaster();
        ray.setFromCamera(new THREE.Vector2(gx, gy), gCam);
        let hits = ray.intersectObject(gCube);
        if(hits.length > 0) {
            let f = Math.floor(hits[0].faceIndex / 2);
            if(f===0){ rotX = Math.PI/2; rotY = 0; }
            else if(f===1){ rotX = -Math.PI/2; rotY = 0; }
            else if(f===2){ rotY = Math.PI/2-0.01; rotX = 0; }
            else if(f===3){ rotY = -Math.PI/2+0.01; rotX = 0; }
            else if(f===4){ rotX = 0; rotY = 0.3; }
            else if(f===5){ rotX = Math.PI; rotY = 0.3; }
            updateCam();
        }
    };

    window.onclick = function(e) {
        if(e.target.closest('#ui-overlay') && !e.target.closest('#menu-toggle')) return;
        if(e.target.closest('#gizmo-container')) return;

        let mouse = new THREE.Vector2(
            (e.clientX / window.innerWidth) * 2 - 1,
            -(e.clientY / window.innerHeight) * 2 + 1
        );
        let ray = new THREE.Raycaster();
        ray.setFromCamera(mouse, camera);
        let hits = ray.intersectObject(glassMesh);
        if(hits.length > 0) {
            let hit = hits[0];
            let pt = hit.point, norm = hit.face.normal;
            let half = boxSize / 2;
            for(let i=0; i<perClick; i++) {
                if(pearls.length >= maxPerls) {
                    let old = pearls.shift();
                    scene.remove(old.mesh); world.remove(old.body);
                }
                let m = new THREE.Mesh(
                    new THREE.SphereGeometry(0.32, 32, 32),
                    new THREE.MeshPhysicalMaterial({ color: selectedColor, metalness: 0.2, roughness: 0.15, clearcoat: 1.0 })
                );
                scene.add(m);
                let b = new CANNON.Body({
                    mass: 0.8,
                    shape: new CANNON.Sphere(0.32)
                });
                b.position.set(
                    Math.max(-half+0.5, Math.min(half-0.5, pt.x + (Math.random()-0.5)*0.8)),
                    Math.max(-half+0.5, Math.min(half-0.5, pt.y + (Math.random()-0.5)*0.8)),
                    Math.max(-half+0.5, Math.min(half-0.5, pt.z + (Math.random()-0.5)*0.8))
                );
                b.velocity.set(
                    -norm.x * 5 + (Math.random()-0.5)*2,
                    -norm.y * 5 + 3 + Math.random()*2,
                    -norm.z * 5 + (Math.random()-0.5)*2
                );
                world.addBody(b);
                pearls.push({ mesh: m, body: b });
            }
            updateCounter();
        }
    };

    for(let i=0; i<20; i++) {
        let m = new THREE.Mesh(
            new THREE.SphereGeometry(0.32, 32, 32),
            new THREE.MeshPhysicalMaterial({ color: selectedColor, metalness: 0.2, roughness: 0.15, clearcoat: 1.0 })
        );
        scene.add(m);
        let b = new CANNON.Body({ mass: 0.8, shape: new CANNON.Sphere(0.32) });
        b.position.set(0, -boxSize/2 + 1 + i*0.1, 0);
        world.addBody(b);
        pearls.push({ mesh: m, body: b });
    }
    updateCounter();

    function loop() {
        world.step(1/60);
        for(let i=0; i<pearls.length; i++) {
            pearls[i].mesh.position.copy(pearls[i].body.position);
            pearls[i].mesh.quaternion.copy(pearls[i].body.quaternion);
        }
        if(!isGizmoDrag) {
            gGroup.quaternion.copy(camera.quaternion).invert();
        }
        gRenderer.render(gScene, gCam);
        renderer.render(scene, camera);
        requestAnimationFrame(loop);
    }
    loop();
};

function buildBox(size) {
    let half = size / 2;
    for(let i=0; i<walls.length; i++) {
        world.removeBody(walls[i]);
    }
    walls = [];

    for(let i=0; i<6; i++) {
        let shape = (i<2) ? new CANNON.Box(new CANNON.Vec3(half, 0.5, half)) : (i<4)? new CANNON.Box(new CANNON.Vec3(0.5, half, half)) : new CANNON.Box(new CANNON.Vec3(half, half, 0.5));
        let body = new CANNON.Body({ mass: 0, shape: shape });
        if(i===0) body.position.set(0, -half, 0);
        if(i===1) body.position.set(0, half, 0);
        if(i===2) body.position.set(-half, 0, 0);
        if(i===3) body.position.set(half, 0, 0);
        if(i===4) body.position.set(0, 0, -half);
        if(i===5) body.position.set(0, 0, half);
        world.addBody(body);
        walls.push(body);
    }

    if(glassMesh) scene.remove(glassMesh);
    if(wireMesh) scene.remove(wireMesh);

    glassMesh = new THREE.Mesh(
        new THREE.BoxGeometry(size, size, size),
        new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.85, opacity: 0.3, transparent: true, side: THREE.BackSide })
    );
    scene.add(glassMesh);

    wireMesh = new THREE.LineSegments(
        new THREE.EdgesGeometry(glassMesh.geometry),
        new THREE.LineBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.4 })
    );
    scene.add(wireMesh);
}

function updateCam() {
    camera.position.x = camDist * Math.sin(rotX) * Math.cos(rotY);
    camera.position.y = camDist * Math.sin(rotY) + 2;
    camera.position.z = camDist * Math.cos(rotX) * Math.cos(rotY);
    camera.lookAt(0,0,0);
}

function updateCounter() {
    let el = document.getElementById('counter');
    if(el) el.innerText = pearls.length + ' / ' + maxPerls;
}