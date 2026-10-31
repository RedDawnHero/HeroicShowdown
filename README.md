# HEROIC SHOWDOWN — CHAPTER ONE

## Contest edition · October 2026

A standalone **one-level** edition of Heroic Showdown. Survive the burning city,
battle the Bonecaller and twin-hammer brutes, and confront Mr. Misfit. The mission
concludes with a **Chapter One Complete** screen; later campaign levels are
deliberately excluded.

## Play

Open `index.html` on a local HTTP server (or deploy these files to a static
hosting provider). Internet access is required to load the Three.js engine
from jsDelivr.

For example, using Python 3:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000/` in a modern browser and choose
**PLAY CHAPTER ONE** → **RISE UP**.

**No account, multiplayer room, or backend server is needed.**
An online entry also lives at the `contest-level-one/` path of the original
HeroicShowdown GitHub Pages site.

## Controls

- **W A S D** or **arrow keys** — move
- **Space** — punch / main attack; **K** — kick
- **J** — jump; **Shift** — dodge; **Control** — run
- **E**, **R**, **Q** — hero abilities as shown in the on-screen HUD
- On touch screens, use the movement pad and action buttons

## Export details

- Source snapshot was copied from the public HeroicShowdown `main` branch.
- Level 2, Level 3, and later cinematic/terrain GLBs are not in this archive.
- Level 1's original hero and Mr. Misfit 3D GLBs are preserved.
- Several optional secondary heroes use the built-in 3D fallback where the
  original repository did not include their GLBs.
- Audio that was missing from the original repository is intentionally not
  requested. Combat sound effects synthesized by the game remain available.
- The largest files are the original high-resolution 3D models, so the ZIP
  is considerably larger than a typical web demo.

## Submission checks

Run the game on the target browser and verify the **PLAY CHAPTER ONE** button,
the **RISE UP** story prompt, 3D rendering, movement, combat, and the final
results screen. Check the contest's separate rules and file-size limits before
submitting, as those criteria have not been supplied.
