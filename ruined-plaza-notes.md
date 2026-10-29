# Level 1 — Fallen Citadel

Level 1 now uses `assets/level-one-ruined-plaza.png`, adapted from the supplied ruined-city image, preserved at `assets/level-one-ruins-reference.jpg`. The previous video is retained as a file but no longer overrides the requested background.

The playable ground spans canonical image rows 478–748 instead of 620–740. The foreground is wider, enemies start farther apart, and nearby hammer enemies separate while walking. Character sizes are preserved.

Host-simulated fire rocks choose a fixed location near a player, show a 2.1-second warning, then impact. Leaving the marker, dodging, jumping or flying avoids damage. A hit does 14 damage, or 5 when blocking. Rendering includes textured tumbling rocks, hot trails, sparks, impact rings, fragments, dust and fading scorch marks. Hazards stop during the intro and outside Level 1. The same ground mapping is used for visual impact locations and characters.

## Image generation

Built-in image generation, saved to `outputs/assets/level-one-ruined-plaza.png`. Original retained.

Prompt: “Use case: precise-object-edit. Edit target: the supplied ruined industrial city photograph. Create a photorealistic widescreen 16:9 game background preserving its distinctive cylindrical ruined towers, slanting collapsed tower at right, bronze storm clouds, smoky fires, weathered metal architecture, warm golden light and realistic material details. Expand the view horizontally. Replace the obstructed chasm and piled foreground debris with a very broad continuous level battle plaza covering the bottom 48 percent of the frame, stretching from left to right. It is cracked soot-dark concrete mixed with worn metal paving and fine scattered rubble, believable continuous ground connected to the distant city. Keep large wreckage at the far left and right edges, leaving the central 85 percent clear for characters moving and fighting. Eye-level slightly elevated cinematic camera, deep perspective, ground fully visible. No people, no text, no UI, no grids, no cartoon rendering, no bright blocky platforms, no meteors frozen in the image: moving meteors are added by code later.”

No live browser playtest performed for this update.
