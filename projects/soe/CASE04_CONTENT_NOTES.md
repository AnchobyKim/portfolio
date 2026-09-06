# CASE04 SOE — Content Notes

## Positioning

SOE is positioned as a **Gameplay Prototyping · Gameplay Programming · System Integration** team-project case study. The story is not “I built the whole game,” but “I validated an early gameplay direction, then made team-authored content and adjacent systems meet at stable production runtime boundaries.”

## My Confirmed Role

- Developer confirmation: before production, Wiseongjun directly implemented a demo prototype to validate the game's core structure.
- Git support: `b7592683` explicitly states that the upload includes code written by Wiseongjun; `9dfc1a83`, `9f4c32bb`, and `658cc59e` show direct test-scene, attack, and enemy-movement work. `6f87d384` later removes the relevant historical scenes as unused.
- Evidence label: `Developer-confirmed / historical Git trace / source no longer retained`.
- Introduced and iterated `TilemapGenerator`, `RenderingManager`, `SpiderQueenMovement`, and the initial `DataDigger` telemetry prototype.
- Integrated environment data with chunk activation, spawn validation, and enemy relocation.
- Integrated boss animation events with state, telegraph, VFX, pattern execution, and player damage.
- Defined and refined combat telemetry fields before the feature moved into a team-owned service architecture.
- Identity mapping confirmed by the developer: `Seongjun-Wi`, `위성준`, and `AnchobyKim` are Wiseongjun.

## Team Boundary

- Environment: team map/obstacle art → my generator/active-chunk boundary → team spawner/gameplay consumers.
- Boss: team animation assets and shared `AnimatorEventProxy` → my boss behavior integration → shared damage/runtime systems.
- Telemetry: my direct instrumentation and CSV schema → teammate `junjjang2` integration into `IStatisticsService` and Event Bus.

## Confirmed Facts Used

- Unity editor version `6000.0.59f2`; URP `17.0.4`; Input System `1.14.2`; Timeline `1.8.9`.
- Five enabled scenes: Launcher, MainMenu, Stage1, MainMenu_Renewal, LoadingScene.
- 646 committed `data_log_*.csv` files.
- Git evidence commits shown on the page.
- Eight contributor identity groups were derived from Git history; this is not presented as official team size.

## Claims Intentionally Avoided

- Official job title, official team size, and official project period.
- Ownership of original art, animation clips/controllers, or the shared `AnimatorEventProxy`.
- Ownership of the entire gameplay architecture.
- Runtime FPS, memory savings, deterministic generation, shipping status, or player-facing performance gains.
- A fresh Play Mode, build, or device validation result.
- Any claim that the whole production architecture was designed by Wiseongjun or that the current structure directly continued from the deleted demo.
- Reconstruction of the deleted demo from current production code, or attribution of every file bundled in `b7592683` to Wiseongjun.

## Existing Media

- `assets/case04/hero/soe-forest-key-art.png`
- Source: SOE repository `SOE_Lobby_Forest.png`, committed by Park-YW in `c57e43eb`.
- The page labels this explicitly as team key art and not gameplay capture.

## Media Still Needed

1. `Environment Debug Overlay`: current player chunk, 3×3 active neighborhood, enemy chunk relocation count/reason, and relevant coordinates. This must be a reusable development overlay, not a `Portfolio`-named feature.
2. `Telemetry Debug Overlay`: current DPS, healing, damage taken, per-skill damage, measurement time, and CSV write state using the same field names as retained telemetry output. This must be a reusable development overlay, not a `Portfolio`-named feature.
3. Optional Stage1 overview still for the project summary.

No in-game recording feature is planned for portfolio production. Boss combat remains documented through source and Git evidence, but no dedicated boss-combat capture is requested.

## Validation Performed

- Static analysis of Unity C# source, scenes/settings, package manifest, and serialized asset references.
- Git log, show, blame, and author identity analysis.
- Full ref/tag/deletion/reflog scan plus unreachable-commit inspection for historical prototype evidence.
- No dedicated prototype branch/tag or additional relevant unreachable commit was found.
- Portfolio HTML parsing, local-link checking, local desktop/mobile browser inspection, and accessibility-tree inspection are part of the publication pass.

## Remaining Gaps

- Developer confirmation: official role/title, official team size, official participation dates, release/build status.
- Fresh Unity Play Mode evidence for the Environment and Telemetry Debug Overlays.
- Exact retained source and authentic media for the early demo; its historical Git footprint remains inspectable, but the demo is not present in the current snapshot.
- Debug Overlay screenshots and measured performance evidence.
