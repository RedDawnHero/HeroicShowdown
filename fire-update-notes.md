# Animated fires on all five levels

- Added photographic fire to every streamed section of the 3D route, on both sides of the walking lane. All five levels use it, including the snowy city.
- Flame geometry and texture coordinates ripple over time while the coal base stays on the ground. Separate smoke puffs rise, spread, drift and fade; embers rise at different speeds.
- Two nearby fires illuminate the ground with flickering orange light. The light count stays fixed as new scenery appears.
- Added the same fire asset with animated smoke and sparks to each of the five photo-background fallback scenes.
- Fire is decorative; this change does not add fire damage or change existing meteor damage.
- Shared textures are reused. Per-section flame/smoke materials and geometry are disposed when leaving the section.

## Asset

Source: `/Users/daevona/Downloads/Show_fire_no_campset_20261018001407.jpg`

Saved cutout: `/Users/daevona/Documents/Codex/2026-10-04/design-and-build-a-real-time/outputs/assets/realistic-fire.png`

Embedded local-file texture transport: `assets/fire-texture-data.js`.

Mode: built-in imagegen, background-extraction edit, transparent background enabled. Original preserved. Result is RGBA with alpha range 0–255 and fully transparent corner pixels.

Final prompt:

Use case: background-extraction. Input image: edit target. Create a game texture cutout of this exact realistic orange yellow fire and charred glowing debris. Remove the white background completely and output true transparent alpha, preserving fine flame edges and soft translucent smoke. Keep the fire appearance, colors, realism and debris, no camping objects. Frame the entire fire centered in a square image with small transparent margins, base at 96 percent image height, highest flame around 12 percent. No ground shadow, no text, no white matte, no solid background.

## Limits

Flames use a photographic cutout with procedural distortion, plus independent smoke and spark particles. This is not a fluid simulation or a generated video. No game runtime tests or browser playtest were run in this change.
