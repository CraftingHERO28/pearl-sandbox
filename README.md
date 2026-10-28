# Pearl Sandbox 

A lightweight 3D physics sandbox running completely in your browser. Spawn hundreds of bouncing pearls inside a transparent container, resize the box on the fly, tweak particle speed and colors, and orbit around using a synced 3D orientation cube.

---

## Why I Built This

I wanted to see how far I could push real-time particle physics in JavaScript without using heavy game engines like Unity or Unreal. I started out building a tiny 2D canvas bouncing ball demo over a weekend, but once I got the collision loops working, I wanted to turn it into a full 3D experience.

Building it in 3D came with a lot of challenges—especially making sure pearls didn't clip through thin wall colliders when hundreds of them spawned at once, and building an interactive camera orientation cube (Gizmo) from scratch so you can look around easily.

---

## Project Evolution (V1 to V5)

I built this project across five distinct stages:

1. **Version 1 (2D Baseline):** Simple HTML5 Canvas prototype with basic gravity, velocity dampening, and wall bounces to test standard physics logic.
2. **Version 2 (3D Move):** Added Three.js for rendering and Cannon.js for rigid-body 3D physics inside a wireframe cube with 40 static test spheres.
3. **Version 3 (Ceiling Spawning):** Added click handlers so pearls would drop in batches straight down from the top box ceiling.
4. **Version 4 (Glass Box & Raycasting):** Replaced wireframe with a physical glass mesh (`MeshPhysicalMaterial`) and added Three.js Raycaster logic so clicking anywhere on a glass panel spawns pearls right at the hit point, shooting inward.
5. **Version 5 (Customization & Controls):** Added the floating control menu with sliders for live container resizing, spawn counts, max particle limits, custom color palette buttons, and a fully interactive 3D camera orientation cube.

---

## Features

- **Dynamic Container Resizing:** Use the slider to scale the glass box in real time (from 4x4x4 to 12x12x12). The physics wall colliders resize instantly to match.
- **Raycast Wall Spawning:** Click anywhere on the glass box faces. The raycaster detects the hit position and shoots a fresh batch of pearls inward relative to the surface normal.
- **Particle Limit & Burst Controls:** Set how many pearls pop out per click (1 to 50) and cap the total box capacity (50 to 1,000) so low-spec devices don't lag.
- **Color Selection:** Switch pearl materials on the fly between pastel and vibrant color presets.
- **Interactive 3D Orientation Gizmo:**
  - Drag the mini cube in the top-right corner to manually orbit the main camera view.
  - Click any mini face (`+X`, `-X`, `+Y`, etc.) to automatically snap the camera to top, front, or side views.
- **Zero Build Setup:** Uses vanilla JS and CDN imports. No `npm install` or node build process needed.

---

## Tech Stack & How It Works

- **Three.js (`r128`):** Handles WebGL rendering, directional lighting, glass transmission materials, camera calculations, and raycasting.
- **Cannon.js (`0.6.2`):** Handles physics stepping (`1/60s`), rigid-body collisions, gravity vectors (`-12 m/s²`), and sphere bounciness (restitution).
- **Tailwind CSS:** Used for quick glassmorphism styling on the control overlay and sliders.

### Problems I Solved:
- **Wall Clipping:** Fast pearls used to tunnel straight through thin plane colliders. To fix this, I replaced plane colliders with thicker static `CANNON.Box` shapes for all six faces and clamped spawning coordinates slightly inside the container boundaries.
- **Camera Synchronization:** The top-right Gizmo cube runs in its own small secondary Three.js scene. On every frame, its orientation is inverted and matched to the main camera quaternion so both stay locked together.

---

## Screenshots & Demo

<img width="846" height="771" alt="Screenshot 2026-10-14 200235" src="https://github.com/user-attachments/assets/f6bdd4fc-9140-4ec8-9655-c63dea1cfa44" />
<img width="1903" height="935" alt="Screenshot 2026-10-22 140218" src="https://github.com/user-attachments/assets/eaf2c1b6-0a98-4a13-ab56-a464e9bbf10e" />


---

## Running It

Just open https://craftinghero28.github.io/pearl-sandbox/
