window.onload = function() {
	let scene = new THREE.Scene();
	let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
	let renderer = new THREE.WebGLRenderer({
		canvas: document.getElementById('app-canvas'),
		antialias: true,
		alpha: true
	});
	renderer.setSize(window.innerWidth, window.innerHeight);

	let ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
	scene.add(ambientLight);

	let dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
	dirLight.position.set(10, 20, 15);
	scene.add(dirLight);

	let world = new CANNON.World();
	world.gravity.set(0, -12, 0);

	let boxSize = 7;
	let walls = [];
	let glassMesh;
	let wireMesh;

	function buildBox(size) {
		let half = size / 2;
		
		for (let i = 0; i < walls.length; i++) {
			world.removeBody(walls[i]);
		}
		walls = [];

		for (let i = 0; i < 6; i++) {
			let shape;
			if (i < 2) {
				shape = new CANNON.Box(new CANNON.Vec3(half, 0.5, half));
			} else if (i < 4) {
				shape = new CANNON.Box(new CANNON.Vec3(0.5, half, half));
			} else {
				shape = new CANNON.Box(new CANNON.Vec3(half, half, 0.5));
			}

			let body = new CANNON.Body({ mass: 0, shape: shape });
			
			if (i === 0) body.position.set(0, -half, 0);
			if (i === 1) body.position.set(0, half, 0);
			if (i === 2) body.position.set(-half, 0, 0);
			if (i === 3) body.position.set(half, 0, 0);
			if (i === 4) body.position.set(0, 0, -half);
			if (i === 5) body.position.set(0, 0, half);

			world.addBody(body);
			walls.push(body);
		}

		if (glassMesh) scene.remove(glassMesh);
		if (wireMesh) scene.remove(wireMesh);

		glassMesh = new THREE.Mesh(
			new THREE.BoxGeometry(size, size, size),
			new THREE.MeshPhysicalMaterial({
				color: 0xffffff,
				transmission: 0.85,
				opacity: 0.3,
				transparent: true,
				side: THREE.BackSide
			})
		);
		scene.add(glassMesh);

		wireMesh = new THREE.LineSegments(
			new THREE.EdgesGeometry(glassMesh.geometry),
			new THREE.LineBasicMaterial({
				color: 0x94a3b8,
				transparent: true,
				opacity: 0.4
			})
		);
		scene.add(wireMesh);
	}

	buildBox(boxSize);

	let rotX = 0;
	let rotY = 0.3;
	let camDist = 16;

	function updateCam() {
		camera.position.x = camDist * Math.sin(rotX) * Math.cos(rotY);
		camera.position.y = camDist * Math.sin(rotY) + 2;
		camera.position.z = camDist * Math.cos(rotX) * Math.cos(rotY);
		camera.lookAt(0, 0, 0);
	}
	updateCam();

	let gScene = new THREE.Scene();
	let gCam = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
	gCam.position.set(0, 0, 4);

	let gRenderer = new THREE.WebGLRenderer({
		canvas: document.getElementById('gizmo-canvas'),
		antialias: true,
		alpha: true
	});
	gRenderer.setSize(80, 80);

	gScene.add(new THREE.AmbientLight(0xffffff, 1.0));
	let gGroup = new THREE.Group();
	gScene.add(gGroup);

	function makeTexture(text, color) {
		let canvas = document.createElement('canvas');
		canvas.width = 128;
		canvas.height = 128;

		let ctx = canvas.getContext('2d');
		ctx.fillStyle = color;
		ctx.fillRect(0, 0, 128, 128);
		ctx.fillStyle = '#ffffff';
		ctx.font = 'bold 44px sans-serif';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(text, 64, 64);

		return new THREE.CanvasTexture(canvas);
	}

	let gCube = new THREE.Mesh(
		new THREE.BoxGeometry(1.4, 1.4, 1.4),
		[
			new THREE.MeshBasicMaterial({ map: makeTexture('+X', '#ef4444') }),
			new THREE.MeshBasicMaterial({ map: makeTexture('-X', '#b91c1c') }),
			new THREE.MeshBasicMaterial({ map: makeTexture('+Y', '#22c55e') }),
			new THREE.MeshBasicMaterial({ map: makeTexture('-Y', '#15803d') }),
			new THREE.MeshBasicMaterial({ map: makeTexture('+Z', '#3b82f6') }),
			new THREE.MeshBasicMaterial({ map: makeTexture('-Z', '#1d4ed8') })
		]
	);
	gGroup.add(gCube);

	let gravityInverted = false;
	let btnGravity = document.getElementById('btn-gravity');
	btnGravity.onclick = function() {
		gravityInverted = !gravityInverted;
		if (gravityInverted) {
			world.gravity.set(0, 12, 0);
			this.innerText = 'Normal Gravity';
		} else {
			world.gravity.set(0, -12, 0);
			this.innerText = 'Invert Gravity';
		}
	};

	let pearls = [];
	let maxPearls = 500;
	let perClick = 20;
	let selectedColor = 0xffb5a7;

	function updateCounter() {
		let counterEl = document.getElementById('counter');
		if (counterEl) {
			counterEl.innerText = pearls.length + ' / ' + maxPearls;
		}
	}

	let btnClear = document.getElementById('btn-clear');
	btnClear.onclick = function() {
		for (let i = 0; i < pearls.length; i++) {
			scene.remove(pearls[i].mesh);
			world.remove(pearls[i].body);
		}
		pearls = [];
		updateCounter();
	};

	let sliderBox = document.getElementById('slider-box');
	sliderBox.oninput = function(e) {
		boxSize = parseFloat(e.target.value);
		document.getElementById('val-box').innerText = boxSize;
		buildBox(boxSize);
	};

	let sliderClick = document.getElementById('slider-click');
	sliderClick.oninput = function(e) {
		perClick = parseInt(e.target.value);
		document.getElementById('val-click').innerText = perClick;
	};

	let sliderMax = document.getElementById('slider-max');
	sliderMax.oninput = function(e) {
		maxPearls = parseInt(e.target.value);
		document.getElementById('val-max').innerText = maxPearls;
	};

	let colorBtns = document.querySelectorAll('.color-btn');
	for (let i = 0; i < colorBtns.length; i++) {
		colorBtns[i].onclick = function(e) {
			e.stopPropagation();
			for (let j = 0; j < colorBtns.length; j++) {
				colorBtns[j].classList.remove('active');
			}
			this.classList.add('active');
			selectedColor = parseInt(this.getAttribute('data-c'));
		};
	}

	let isDragging = false;
	let isGizmoDrag = false;
	let prevX = 0;
	let prevY = 0;

	window.onmousedown = function(e) {
		if (e.target.closest('#control-box')) return;
		if (e.target.closest('#gizmo-container')) {
			isGizmoDrag = true;
			prevX = e.clientX;
			prevY = e.clientY;
			return;
		}
		isDragging = true;
		prevX = e.clientX;
		prevY = e.clientY;
	};

	window.onmousemove = function(e) {
		if (isGizmoDrag) {
			gCube.rotation.y += (e.clientX - prevX) * 0.02;
			gCube.rotation.x += (e.clientY - prevY) * 0.02;
			prevX = e.clientX;
			prevY = e.clientY;
			return;
		}
		if (!isDragging) return;

		rotX -= (e.clientX - prevX) * 0.008;
		rotY = Math.max(-1.4, Math.min(1.4, rotY + (e.clientY - prevY) * 0.008));
		updateCam();

		prevX = e.clientX;
		prevY = e.clientY;
	};

	window.onmouseup = function() {
		isDragging = false;
		if (isGizmoDrag) {
			isGizmoDrag = false;
			gCube.rotation.set(0, 0, 0);
		}
	};

	let gizmoContainer = document.getElementById('gizmo-container');
	gizmoContainer.onclick = function(e) {
		if (isGizmoDrag) return;

		let rect = this.getBoundingClientRect();
		let gx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
		let gy = -((e.clientY - rect.top) / rect.height) * 2 + 1;

		let raycaster = new THREE.Raycaster();
		raycaster.setFromCamera(new THREE.Vector2(gx, gy), gCam);
		
		let intersects = raycaster.intersectObject(gCube);
		if (intersects.length > 0) {
			let faceIndex = Math.floor(intersects[0].faceIndex / 2);
			if (faceIndex === 0) { rotX = Math.PI / 2; rotY = 0; }
			else if (faceIndex === 1) { rotX = -Math.PI / 2; rotY = 0; }
			else if (faceIndex === 2) { rotY = Math.PI / 2 - 0.01; rotX = 0; }
			else if (faceIndex === 3) { rotY = -Math.PI / 2 + 0.01; rotX = 0; }
			else if (faceIndex === 4) { rotX = 0; rotY = 0.3; }
			else if (faceIndex === 5) { rotX = Math.PI; rotY = 0.3; }

			gCube.rotation.set(0, 0, 0);
			updateCam();
		}
	};

	window.onclick = function(e) {
		if (e.target.closest('#control-box')) return;
		if (e.target.closest('#gizmo-container')) return;

		let mouse = new THREE.Vector2(
			(e.clientX / window.innerWidth) * 2 - 1,
			-(e.clientY / window.innerHeight) * 2 + 1
		);

		let raycaster = new THREE.Raycaster();
		raycaster.setFromCamera(mouse, camera);

		let intersects = raycaster.intersectObject(glassMesh);
		if (intersects.length > 0) {
			let hit = intersects[0];
			let point = hit.point;
			let normal = hit.face.normal;
			let half = boxSize / 2;

			for (let i = 0; i < perClick; i++) {
				if (pearls.length >= maxPearls) {
					let oldPearl = pearls.shift();
					scene.remove(oldPearl.mesh);
					world.remove(oldPearl.body);
				}

				let mesh = new THREE.Mesh(
					new THREE.SphereGeometry(0.32, 32, 32),
					new THREE.MeshPhysicalMaterial({
						color: selectedColor,
						metalness: 0.2,
						roughness: 0.15,
						clearcoat: 1.0
					})
				);
				scene.add(mesh);

				let body = new CANNON.Body({
					mass: 0.8,
					shape: new CANNON.Sphere(0.32)
				});
				body.position.set(
					Math.max(-half + 0.5, Math.min(half - 0.5, point.x + (Math.random() - 0.5) * 0.8)),
					Math.max(-half + 0.5, Math.min(half - 0.5, point.y + (Math.random() - 0.5) * 0.8)),
					Math.max(-half + 0.5, Math.min(half - 0.5, point.z + (Math.random() - 0.5) * 0.8))
				);
				body.velocity.set(
					-normal.x * 5 + (Math.random() - 0.5) * 2,
					-normal.y * 5 + 3 + Math.random() * 2,
					-normal.z * 5 + (Math.random() - 0.5) * 2
				);

				world.addBody(body);
				pearls.push({ mesh: mesh, body: body });
			}
			updateCounter();
		}
	};

	let startHalf = boxSize / 2;
	for (let i = 0; i < 20; i++) {
		let mesh = new THREE.Mesh(
			new THREE.SphereGeometry(0.32, 32, 32),
			new THREE.MeshPhysicalMaterial({
				color: selectedColor,
				metalness: 0.2,
				roughness: 0.15,
				clearcoat: 1.0
			})
		);
		scene.add(mesh);

		let body = new CANNON.Body({
			mass: 0.8,
			shape: new CANNON.Sphere(0.32)
		});
		body.position.set(
			(Math.random() - 0.5) * 2,
			-startHalf + 1.5 + (i * 0.15),
			(Math.random() - 0.5) * 2
		);
		body.velocity.set(
			(Math.random() - 0.5) * 1,
			Math.random() * 1,
			(Math.random() - 0.5) * 1
		);

		world.addBody(body);
		pearls.push({ mesh: mesh, body: body });
	}
	updateCounter();

	window.onresize = function() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	};

	function animate() {
		world.step(1 / 60);

		for (let i = 0; i < pearls.length; i++) {
			pearls[i].mesh.position.copy(pearls[i].body.position);
			pearls[i].mesh.quaternion.copy(pearls[i].body.quaternion);
		}

		if (!isGizmoDrag) {
			gGroup.quaternion.copy(camera.quaternion).invert();
		}

		gRenderer.render(gScene, gCam);
		renderer.render(scene, camera);
		requestAnimationFrame(animate);
	}
	animate();
};