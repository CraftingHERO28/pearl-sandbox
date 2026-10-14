let animationFrameId = null;

function initV2() {
    const canvas = document.getElementById('app-canvas');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 16);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    scene.add(new THREE.AmbientLight(0xffffff, 1.0));
    const dir = new THREE.DirectionalLight(0xffffff, 1);
    dir.position.set(5, 10, 7);
    scene.add(dir);

    const world = new CANNON.World();
    world.gravity.set(0, -10, 0);

    const boxSize = 6;
    const half = boxSize / 2;
    const wallMat = new CANNON.Material();
    const sphereMat = new CANNON.Material();

    world.addContactMaterial(new CANNON.ContactMaterial(sphereMat, wallMat, { restitution: 0.7 }));
    world.addContactMaterial(new CANNON.ContactMaterial(sphereMat, sphereMat, { restitution: 0.7 }));

    const floor = new CANNON.Body({ mass: 0, material: wallMat, shape: new CANNON.Box(new CANNON.Vec3(half, 0.5, half)) });
    floor.position.set(0, -half, 0);
    world.addBody(floor);

    const ceiling = new CANNON.Body({ mass: 0, material: wallMat, shape: new CANNON.Box(new CANNON.Vec3(half, 0.5, half)) });
    ceiling.position.set(0, half, 0);
    world.addBody(ceiling);

    const left = new CANNON.Body({ mass: 0, material: wallMat, shape: new CANNON.Box(new CANNON.Vec3(0.5, half, half)) });
    left.position.set(-half, 0, 0);
    world.addBody(left);

    const right = new CANNON.Body({ mass: 0, material: wallMat, shape: new CANNON.Box(new CANNON.Vec3(0.5, half, half)) });
    right.position.set(half, 0, 0);
    world.addBody(right);

    const geom = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
    const wire = new THREE.LineSegments(new THREE.EdgesGeometry(geom), new THREE.LineBasicMaterial({ color: 0x94a3b8 }));
    scene.add(wire);

    const spheres = [];
    const sphereGeom = new THREE.SphereGeometry(0.3, 16, 16);
    for(let i=0; i<40; i++) {
        const mesh = new THREE.Mesh(sphereGeom, new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
        scene.add(mesh);
        const body = new CANNON.Body({ mass: 1, material: sphereMat, shape: new CANNON.Sphere(0.3) });
        body.position.set((Math.random()-0.5)*3, (Math.random()-0.5)*3, (Math.random()-0.5)*3);
        world.addBody(body);
        spheres.push({ mesh, body });
    }

    function resize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', resize);

    let isDrag = false, prevX = 0, prevY = 0, rotX = 0, rotY = 0;
    function onDown(e) { isDrag = true; prevX = e.clientX; prevY = e.clientY; }
    function onMove(e) {
        if(!isDrag) return;
        rotX -= (e.clientX - prevX) * 0.01;
        rotY = Math.max(-1.2, Math.min(1.2, rotY + (e.clientY - prevY) * 0.01));
        camera.position.x = 16 * Math.sin(rotX) * Math.cos(rotY);
        camera.position.y = 16 * Math.sin(rotY) + 2;
        camera.position.z = 16 * Math.cos(rotX) * Math.cos(rotY);
        camera.lookAt(0,0,0);
        prevX = e.clientX; prevY = e.clientY;
    }
    function onUp() { isDrag = false; }
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    function loop() {
        world.step(1/60);
        for(let s of spheres) {
            s.mesh.position.copy(s.body.position);
            s.mesh.quaternion.copy(s.body.quaternion);
        }
        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(loop);
    }
    loop();
}

window.onload = function() {
    initV2();
};