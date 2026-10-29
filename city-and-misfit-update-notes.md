# City and Mr. Misfit update

## Mr. Misfit pursuit

Replaced the unrelated oscillating boss position with player pursuit. He keeps a living player as his target, turns toward them, closes the distance, winds up a dodgeable close attack, and fires at targets farther away. Ice-level pursuit uses the existing terrain paths and movement collision handling. Routing refreshes every 0.65 seconds instead of rebuilding a path every frame. Boss targeting is host controlled.

## Red Dawn cinematic

Level-two Mr. Misfit defeat brings Red Dawn into the cinematic, even when another hero is selected. A side camera shows Red Dawn winding up and landing a powered punch at 2.65 seconds. Mr. Misfit's remaining cinematic health is removed at impact, followed by the overhead explosion at 4.2 seconds. Level three begins after eight seconds. Ecal's Dark Armored finisher remains the final-level sequence.

## Level-one buildings

The supplied reference is preserved as `assets/burning-city-reference.jpg`. New roadside buildings are actual 3D geometry assembled from floors, recessed windows, masonry piers, glass panels, doors, broken corners and exposed supports. Roofs include water tanks, vents, HVAC equipment, solar panels and antennas. Building parts are instanced by material to limit draw calls. Buildings stream along the road as the player travels. Flames and embers move at damaged upper floors, with smoke rising toward the roofs. The central route stays open; the buildings sit beyond the playable road boundaries.

The structures are modeled in code using the reference's architectural features, rather than exact scans of the pictured buildings. Source changes were reviewed; gameplay and visual performance have not been playtested.
