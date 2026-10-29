# Exploration and Ecal pose

The 3D renderer now uses a ground plane and streamed sections of volumetric ruined architecture. Broken extruded walls have window openings and jagged tops. Arches, leaning columns, metal beams, rubble, falling fragments and animated fire occupy real world coordinates, with fog, light and shadows. Seven nearby route sections remain loaded; sections behind the camera are disposed and new ones appear ahead.

The supplied images are retained in assets as `snow-road.jpg`, `red-lake.jpg`, `red-mountains.jpg`, `ruin-arches.jpg` and `red-ruin-arches.jpg`. They provide level-specific surface textures and distant sky imagery. The nearby architecture is constructed geometry, rather than an automatic reconstruction of the photographs. Data-backed image sources allow texture uploads when the game is opened locally.

Forward travel extends to logical Y -18000, about a kilometre of 3D route at the existing scale. Level time was increased to five minutes. Existing combat and level-completion rules remain. The camera follows at walking/running distances, with first-person and front-facing alternatives retained. Click movement and combat overlays use the active camera's ground projection. The illustrated fallback retains its earlier photo presentation when 3D cannot load.

Ecal's shoulder, elbow and wrist pivot heights were lowered to suit his actual proportions. His aim pose now uses a bent elbow. Gun-area vertices are rigidly attached to the forearm and the head/ears have their own weights. This is still an automatic runtime rig, not a hand-authored animation asset.

No live gameplay test was run for this update. Visual pose quality, collisions at scenery edges and performance require in-game review.
