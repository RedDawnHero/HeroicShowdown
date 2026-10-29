# Ashen King transition and boss camera update

- Red Dawn punch damage against brutes / boss: 6 -> 8. Mask laser: 12 -> 18 against brutes, 11 -> 15 against bosses. Other existing attack multipliers retained.
- Bonus damage now finalizes deaths, health rewards and boss completion immediately.
- Ashen King defeat in level one freezes combat and starts the supplied movie directly. His death explosion is reserved for level two.
- Full-screen `assets/ashen-king-transition.mov` is copied from the supplied My Movie 14.MOV; H.264 and AAC tracks were identified from the file. Play-with-sound fallback, Skip Video, playback-error retry, visibility pause and keyboard focus handling are included.
- The host waits for every connected player to finish/skip the movie. Disconnected players are removed by existing connection handling.
- After the movie, the heroes walk through a glowing portal in level one. Only after everyone enters does level two initialize, where the existing frozen-terrain spawn/collision handling resumes.
- Removed the older premature dimension teleport after the burial scene.
- Both Ashen King in level two and Dark Armored in the final level pan to the villain's face, then reach a bird's-eye view before the explosion at 4.2 seconds. The Ashen King sequence advances to level three after eight seconds; the Dark Armored sequence ends the game.
- A time-out now ends the run instead of silently advancing into the next level.
- Full 3D camera and portal rendering are supplied with a simpler canvas fallback.

Implementation source was inspected. No gameplay, browser playback, or automated tests were run in this change.
