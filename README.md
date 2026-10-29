# Pearl Sandbox

Hey! I built this project because I wanted to mess around with 3D physics in the browser using Three.js and Cannon.js without relying on massive game engines. 

It started as a stupid simple 2D bouncing ball test and slowly evolved into a glass box where you can spawn and stack hundreds of glowing pearls.

## What it actually does

- **Click to Spawn:** Click on any side of the glass box and a bunch of pearls shoot inside based on where your mouse hit.
- **Box Resizing:** You can drag the slider to scale the container live from a tiny 4x4 cube up to a massive 12x12 arena.
- **Gravity Flip:** Added a toggle button so you can reverse gravity and watch all the pearls fly up to the ceiling.
- **Custom Colors:** Pick between a few different pastel/vibrant colors for the spheres.
- **Camera Gizmo:** Drag or click the mini cube in the top right to quickly snap your camera angles around.

## How I put it together

I used vanilla HTML, CSS, and JS with CDN links for Three.js (`r128`) and Cannon.js (`0.6.2`). 

The hardest part by far was dealing with wall clipping—at first, fast-moving pearls kept phasing right through the thin boundaries when I spawned too many at once. I fixed it by swapping out flat plane colliders for thick `CANNON.Box` shapes on all six sides and clamping the spawn positions.

Also built a separate mini scene in the corner for the camera gizmo, syncing its rotation matrices with the main camera every frame so it doesn't drift.

## Running it

No npm, no build steps, no webpack. Just clone the repo and open `index.html` in your browser. Have fun breaking the physics engine!


<img width="846" height="771" alt="Screenshot 2026-10-14 200235" src="https://github.com/user-attachments/assets/2a483f55-7d37-4c25-a10a-9d48ddb1c7dd" />
<img width="1903" height="935" alt="Screenshot 2026-10-22 140218" src="https://github.com/user-attachments/assets/49ce4857-77b8-4866-8956-148adaf1eeb6" />
