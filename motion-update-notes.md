# Character and environment motion

- Ecal has a four-joint tail chain. A travelling wave, turn response, jump curl and dodge response are applied separately from his arms and legs. The illustrated fallback also animates the tail.
- Hammer enemies now use the same runtime skeletal skinning system as imported playable heroes, with shoulder, elbow, hip, knee and ankle movement. The original model's weapons move with its arms; duplicate floating hammer props are hidden once the model loads.
- Walking has larger counter-swings, swing-phase knee flexion, ankle compensation and blended starts/stops. Procedural heroes also rotate their shoulders and head during movement.
- Identical enemy copies share weighted geometry to avoid duplicating the large mesh buffers. Each copy retains its own skeleton and pose.
- Local-file model loading now supports all imported models and the helmeted Red Dawn pose via lazily loaded data scripts.
- `assets/level-one-fire-rocks.mov` is the supplied video, copied unchanged. It loops muted during Level 1, pauses outside the level and behind the intro, and is drawn behind a feathered photographic dry shoreline. The existing animated photograph remains the fallback when video decoding is unavailable. The source uses HEVC; system conversion to MP4 was unavailable.
- Every level retains its shared ground mapping, foot contact correction and shadows. Level 1's foreground remains stable while the video plays above it.
- Added staggered mountain rockfalls and expanding dust plumes to the mountain photograph scenes. City scenes retain moving debris, dimensional fragments, smoke and snow.

These are procedural in-game rigs and effects. This update has not been playtested in the live browser; exact skin weights and motion quality still require visual review.
