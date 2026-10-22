# pearl-sandbox

Pearl Sandbox
Hey everyone! Welcome to the Pearl Sandbox project! This repository contains a step-by-step, interactive 3D physics experiment where you can drop pearls inside a glass container, tweak physics and environmental parameters on the fly, and play around with interactive 3D camera controls.

About the Project
This whole project started as a quick weekend experiment to see how far we could take simple particle physics in the browser using HTML5, CSS3, Three.js, and Cannon.js. What began as a lightweight 2D canvas prototype quickly grew into a fully realized 3D sandbox complete with custom lighting, realistic boundary collisions, custom UI menus, and raycast spawning.

Across five distinct versions, the sandbox evolved from basic gravity balls bouncing in 2D to an interactive, fully customizable 3D glass box filled with shiny pearls.

How it Evolved (V1 to V5)
Version 1: The 2D Prototype
The journey started with a plain 2D HTML Canvas setup. We created basic gravity calculations, floor/wall collision dampening, and click-to-spawn pearl clusters just to verify that the core bouncing loop felt fun and responsive.

Version 2: Stepping into 3D
Once the 2D version worked, we brought in Three.js for rendering and Cannon.js for 3D physics. We replaced the 2D box with a 3D wireframe box, added floor, ceiling, and side wall hitboxes, and dropped a static batch of 40 pearls inside to test 3D bouncing and orbital camera controls.

Version 3: Ceiling Drops
In Version 3, we hooked up user interactivity. Clicking anywhere on the screen would drop batches of bright pink pearls right from the top ceiling of the box, allowing them to rain down, collide with each other, and settle naturally at the bottom.

Version 4: Precise Raycast Spawning & Glass Box
Version 4 was all about precision. We swapped the wireframe box for a transparent glass mesh and added Three.js Raycasting. Instead of pearls dropping blindly from the top ceiling, they now spawn exactly where your mouse clicks on any of the glass box walls and shoot inward. We also fixed boundary glitching so pearls never clip through solid walls.

Version 5: The Final Polished Sandbox
Version 5 brings everything together into a complete, customizable sandbox app:

-Box Size Control: Dynamic slider to scale the glass container size live.
-Pearl Spawn Rates: Slider to choose how many pearls (from 1 to 50) pop out per click.
-Pearl Limits: Slider to set the max capacity inside the box (from 50 up to 1000 pearls).
-Color Selection: Interactive color palette with pastel and vibrant material presets.
-Interactive 3D Gizmo: A top-right orientation cube that you can click or click-and-drag to seamlessly rotate and align the main 3D camera view.
-Collapsible UI: Clean glassmorphism overlay menu that collapses whenever you want an uncluttered view.
