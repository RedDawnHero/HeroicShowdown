# Walkable frozen landscape — level two

Source: `/Users/daevona/Downloads/frozen landscape 3d model.glb` (original preserved).

## Changes

- Level two uses the supplied textured landscape model in place of the generated ruin avenue. Other levels retain their scenery.
- Copied the model to `assets/frozen-landscape.glb` and created `assets/frozen-landscape-data.js` so the current local-file game can load it without a file-fetch restriction.
- Applied a uniform scale of 52 and world Z offset of -5. Rendering, collision sampling, pointer picking and foot placement use the same coordinates.
- Generated a 256 × 256 collision field from the model triangles. Steep slopes, vertical walls, unsupported areas and the outer boundary are blocked, with a body-width margin. The largest connected snow surface supplies spawn positions for heroes, enemies and health pickups.
- Swept movement in small steps prevents walking, running, dodges and knockback from skipping through obstacles; blocked movement can slide along a surface.
- Characters follow the terrain elevation. The camera follows that elevation and shortens its follow distance when terrain obstructs the view.
- Preserved animated fires and added falling snow. The game pauses its simulation while the landscape loads, with a retry button if loading fails.

## Limits

This uses a conservative height-field collision map, not full mesh rigid-body physics. Overhangs and tunnels are not traversable beneath their upper surface. Movement collision applies to actors; this change does not add projectile-to-wall collision. The imported model contains approximately 1.9 million triangles and may take a moment to load.

The model structure and generated surface data were inspected during implementation. No automated tests or live browser playtest were run.

Implementation: `frozen-landscape.js`, `travel-world.js`, `world3d.js`, `game.js`, `index.html`. Rebuild source for collision assets: `tools/prepare-frozen-terrain.py`.

## Movement and Ecal follow-up

- Removed the largest-component restriction for traversal. All supported walkable terrain is available; the largest connected region is now used only for safe spawning. The slope allowance was increased for snowy hills while vertical walls, cliffs and unsupported holes remain blocked.
- Removed an extra four-cell clearance restriction that closed narrow paths. Swept movement and a maximum step height still prevent passing through cliffs.
- Clicking in the ice level now finds a route around obstacles to a reachable destination. Analog speed near route waypoints prevents overshooting. The lower map edge is no longer cut off by the old arena limit.
- Animation now uses actual resolved movement speed, including click movement. Ecal has stronger alternating thigh/knee motion, relaxed bent elbows and arm swing while walking. Lower leg weights take precedence over the torso and weapon masks; the tail mask no longer covers the whole rear half of a leg. His illustrated fallback also has larger alternating steps and arm motion.
- These are source and asset changes. No live playtest or automated tests were run for this follow-up.
