# Mr. Misfit

Replaces the former Ashen King boss with the supplied `villain armor 3d model 3.glb`.

- Model copied to `assets/mr-misfit.glb`.
- Embedded transport in `assets/mr-misfit-model-data.js` supports opening the game directly from its local HTML file.
- Model contains one mesh with embedded textures, no skin, no animation clips and no required extensions. It is normalized to the existing boss height and connected to the existing runtime skeleton, walking, blocking and attack poses.
- Boss health bar, dialogue, intro text, combat messages, defeat caption and results text use Mr. Misfit.
- Existing internal boss identifiers remain unchanged to preserve the movie/portal progression and shared cinematic code.
- Level-one defeat plays the supplied transition movie then opens the portal. Level-two death uses the close-up and overhead explosion scene. Dark Armored retains the final villain role and Ecal finishing-shot sequence.

No gameplay or automated tests were run for this update.

## Saved skeleton update

Mr. Misfit now uses `assets/mr-misfit-rigged.glb`, a skinned asset with 19 bones, normalized vertex weights, inverse bind matrices, and embedded Idle, Walk, Run, Block and Attack clips. His original uploaded mesh and textures are retained in the unrigged source asset. The active game drives the saved bones through its responsive gait and combat poses; it no longer builds a replacement skeleton for this boss on load. Each spawned boss receives its own cloned skeleton.

Rig generation source is `tools/rig-mr-misfit.py`; local HTML loading uses `assets/mr-misfit-rigged-model-data.js`. Skin weights are assigned procedurally from body regions and blended at the joints. No playtest or automated test was run.
