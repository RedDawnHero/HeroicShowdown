# Ecal playable update

Ecal is fifth in the hero picker. Existing heroes remain available.

- Imported model: `assets/ecal-model.glb`, copied from the supplied feline warrior file.
- The source contains one mesh and no skin or animation. The game creates a skeleton with weighted vertices and animates walking, knees, arms, jumping, dodge, aiming and recoil. These are runtime procedural animations, not artist-authored clips saved into the GLB.
- **L:** raise/lower blasters. **E / Space:** twin blast. **Shift:** quick dodge. **J:** jump.
- Sound: `assets/ecal-blast.m4a`, copied from the supplied recording, played for each accepted shot.
- Local-file model transport: `assets/ecal-model-data.js` contains the same GLB bytes for local-file loading; HTTP entrypoints use the GLB directly.
- Shared photo-ground coordinates register feet, attacks and movement to visible ground. Boot contact corrects imported and procedural poses. Natural dry shoreline was added to the two lake scenes.

## Artwork

Built-in image generation was used. Original images were preserved.

`assets/ecal-character.png` is the illustrated fallback. Prompt: “Use case: background-extraction. Edit target: Ecal character reference. Create an exact clean cutout of this full character on a genuinely transparent background. Preserve the entire character design, large ears, orange copper helmet and armor, green striped fur, tail, torn cape and red scarf, twin cyan glowing blasters, pose and proportions exactly. Keep both boots fully visible. Remove only the white background and floor shadow. No text, no redesign. Portrait 2:3 framing, character fills frame with small transparent margin.”

`assets/meteor-forest-grounded.png` and `assets/meteor-lake-grounded.png` use the same prompt: “Use case: precise-object-edit. Edit target: cinematic lake environment. Keep the photorealistic sky, mountain skyline, burning pine forest, distant fires and lake. Change ONLY the foreground composition so the entire bottom 32 percent of the wide image is a broad contiguous dry natural gravel and flat weathered rock shoreline where game characters can stand and fight. The shore must span the FULL image width edge to edge at the bottom, gently sloping into the lake around 65 percent down the image, with expansive fairly level walkable ground and no large obstructing rocks. Photorealistic fine gravel, natural dirt, scattered small stones, damp patches, grounded light from orange sky; no square blocks, no artificial platform, no cartoon style. Lake still visible as broad horizontal band in middle distance. No characters, no falling meteors or airborne debris (added later as animated layers). Preserve widescreen 16:9 composition.”

Live browser playtesting was not performed. The automatic weights may need adjustment after seeing the imported model move in the game.
