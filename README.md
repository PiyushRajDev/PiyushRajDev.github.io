# Piyush Raj — Portfolio

https://piyushrajdev.github.io/

## Interactive system map

The hero's right column contains an interactive, 3D-style conceptual dependency map rendered with a lightweight 2D canvas projection. It presents 11 nodes across transport, project, state/storage, observability and environment categories, connected by 13 conceptual edges.

The project nodes are based on the portfolio's current work: Vāk, OASIX, SkillLighthouse and MetaSpace. Infrastructure nodes represent the real-time transport, storage and observability concepts used across those projects and engineering experiments. The local runtime boundary is deliberately isolated to show that it sits outside the conceptual service mesh.

### Interaction and rendering

- Drag the canvas to rotate the scene; select a node to inspect its purpose.
- The node selector is keyboard accessible and provides the same inspection interaction without pointer input.
- "Pause flow" stops the small animated packets; "Reset" restores the initial camera.
- The moving packets are explicitly labelled simulated flow. The map is conceptual, not connected to live telemetry, and it does not invent latency or traffic measurements.
- The map is drawn with the Canvas 2D API and a small perspective projection. It has no Three.js/WebGL dependency.
- Rendering pauses when the map leaves the viewport or the browser tab is hidden. Device pixel ratio is capped at 1.6.
- `prefers-reduced-motion` renders a still frame. The map remains selectable and rotatable.
- Colors come from the existing page theme tokens plus subdued category colors, and update when the light/dark theme changes.
- The canvas is hidden from assistive technology; native buttons and a select expose pause, reset and node inspection to keyboard users.

## Pigeon-delivered hero portrait

The hero profile image starts in a reserved blank frame. On initial load, a small inline-SVG pigeon carrying a letter flies from the last pointer position observed by the page (using a viewport-center origin if no pointer movement has been recorded) to the portrait. The image is revealed when the bird arrives. Visitors with reduced-motion enabled see the portrait immediately, without the flight. The uploaded monochrome portrait is stored as `public/piyush-avatar.webp`.

## Browser icon and social preview

The browser-tab icon is a vector SVG traced from the monochrome profile portrait at `src/app/icon.svg`. The social share card is generated locally at build time by `src/app/opengraph-image.tsx` using Next.js `ImageResponse`. It includes the local portrait, hero positioning, tagline and a system-map motif; it requires no external image host or new dependency.
