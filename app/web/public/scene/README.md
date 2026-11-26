# Scene assets (placeholder)

The living Christmas scene from DEPLOY.md's Design + Engineering
sections — layered room art, one canvas for snow/glow/tobogganers,
Rive for Cosmo and the kittens — lands in a later slice. This slice
ships `src/components/ChristmasScene.vue`, a static CSS treatment,
as the placeholder.

Finished scene assets (with their sources) will live in this folder
and be served from `/scene/` — nginx.conf already carries the MIME
types (.riv / .wasm), immutable cache headers, and serving checks
the spec requires for them.
