# Dark Armored boss update

- Final-level Dark Armored health increased from 100 to 420. Both the existing top meter and a prominent named arena meter show the correct fraction; the arena meter includes numeric health and attack phase.
- Dark Armored pursues heroes through the extended route, alternates shadow bolts, targeted shockwaves and charges, and becomes faster and stronger below half health.
- Charges and shockwaves have 1.2 seconds of warning (0.9 seconds when enraged), marked on the ground at the actual damage radius. Dodging, jumping and flying avoid them; blocking reduces damage.
- His defeat starts an eight-second cinematic before results. The camera closes in on the locally selected hero, then pulls out to include Dark Armored. At 4.2 seconds his model disappears in an energy burst, scattered armor, a shockwave, smoke, light and an explosion sound.
- Combat, countdown, caster summons and player actions stop during the cinematic. The host synchronizes its timing with connected players. A simpler zoom and explosion is provided in the illustrated fallback renderer.
- Timeout results no longer claim the villain was defeated.
- Dark Armored still appears only in the fifth/final level.

Files changed: `game.js`, `world3d.js`, `index.html`; added `dark-boss.js`.

No automated tests or browser playtest were run. Difficulty and cinematic framing have not been assessed in a live game.
