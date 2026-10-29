# Animated scenery

The game now uses the supplied photographs as layered animated backgrounds. Levels 1 and 3 have falling photo-textured meteors, smoke trails, flickering forest fires, lake ripples and impact effects. Level 2 has moving snow, mist and falling debris. Levels 4 and 5 have tumbling city fragments, dust and dim pulsing tower light. The forest river photograph appears behind the Rise Up screen with moving water, foliage and mist.

The earlier geometric scenery is hidden during this presentation. Character models, controls, camera views and level progression are retained. Dark Armored Warrior remains reserved for Level 5.

## Prepared images

Prepared with the built-in image_gen tool. Original user images were retained. Clean background plates remove frozen meteors so animated rocks can move without duplicate stationary rocks.

- [Meteor forest plate](assets/meteor-forest-clean.png)
- [Meteor lake plate](assets/meteor-lake-clean.png)
- [Forest river source](assets/forest-river.jpg)

## Exact prompts

### Meteor forest

Use case: precise-object-edit. Asset type: clean background plate for layered photo animation in a game. Edit target: the attached image. Remove every falling meteor, flying rock, flame trail, and long diagonal black meteor smoke trail from the SKY ONLY, reconstruct the red dusk storm clouds and mountain backdrop behind them. Keep the forest, lakeshore, mountain silhouettes, distant orange forest fires and lake reflections. Remove white impact flashes but retain forest fires. The lake should show water instead of frozen splash shapes. No flying objects. Preserve the exact landscape composition and camera framing, photorealistic fine detail, high resolution widescreen 16:9. Do not add characters, text, borders, illustrations, low-poly shapes or new buildings. This is a scenery cleanup, preserve everything except the specified removable objects. Other layers will animate the removed elements.

### Meteor lake

Use case: precise-object-edit. Asset type: clean background plate for layered photo animation in a game. Edit target: the attached image. Remove every falling meteor, flying rock, flame trail and long diagonal black meteor smoke trail from the sky, and remove the large frozen water splash and airborne debris in the center of the lake. Reconstruct the red dusk sky, mountains and calm water behind them. Preserve forest, mountain silhouettes, orange forest fires, viewpoint and lake reflections. No flying objects, no static frozen splash. Preserve the exact landscape composition and camera framing, photorealistic fine detail, high resolution widescreen 16:9. Do not add characters, text, borders, illustrations, low-poly shapes or new buildings. This is a scenery cleanup, preserve everything except the specified removable objects. Other layers will animate the removed elements.

## Checks

JavaScript syntax checks passed for cinematic-backgrounds.js, game.js and world3d.js. The actual background renderer produced frames for every level plus the forest scene, including narrow and wide viewport sizes. Comparing frames 0.7 seconds apart found visible animation in all six scenes. Rendered frames were reviewed visually. Browser control could not open the file:// address because that protocol is blocked; this was not a live gameplay test. CPU canvas timing is not a measure of browser GPU performance. The game limits background rendering to 30 frames per second and 1376 pixels wide, skips obsolete scenery updates, and reuses textures to limit work.

