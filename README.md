# Pearl Sandbox 🔮

A 3D physics experiment in the browser where you can drop bouncing pearls into a glass box, change colors, resize the container, and orbit around using a small 3D cube in the corner.

Built for the Hack Club Stardance challenge.

---

## What is this?

I started this project as a quick weekend test to see how hard it would be to build 3D sphere physics in JavaScript. It started as a basic 2D bouncing ball script on an HTML canvas and slowly turned into a full 3D sandbox:

- **V1:** Basic 2D canvas gravity & bounce testing.
- **V2:** Brought in Three.js and Cannon.js for 3D physics inside a wireframe cube.
- **V3:** Added click dropping from the ceiling.
- **V4:** Replaced wireframe with a physical glass box and added raycasting so pearls spawn right where you click on the walls.
- **V5:** Added the control panel (sliders for box size, pearl count, speed), color selection, and the synced gizmo cube.

---

## Features

- **Dynamic Box Size:** Make the box bigger or smaller (4x4 to 12x12).
- **Raycast Spawning:** Pearls shoot inward from wherever your mouse clicks on the glass.
- **Color Picker:** Choose between different pearl colors.
- **Spawn Controls:** Change how many pearls drop per click (1 to 50) and max box capacity (up to 1,000).
- **Interactive Gizmo:** Drag the mini cube in the top right corner to rotate the camera, or click any face to align the view.
- **No Build Tools:** Runs straight out of `index.html` with vanilla JS and CDN links.

---

## How I Made It

- **Three.js (`r128`):** Renders the 3D scene, lighting, glass materials, and mouse raycasting.
- **Cannon.js (`0.6.2`):** Handles gravity, sphere-on-sphere collisions, and wall bounces.
- **Tailwind CSS:** Quick styling for the floating glassmorphism control menu.

The main challenge was keeping pearls from clipping through walls when spawning lots of them at once. Solved it by using thicker static box colliders for the container walls and clamping spawn positions.

---

## Screenshots 



---

## Running It

Just open https://craftinghero28.github.io/pearl-sandbox/