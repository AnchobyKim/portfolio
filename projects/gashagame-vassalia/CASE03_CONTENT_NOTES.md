# Positioning

GashaGame / VASSALIA는 **Related Projects / Shared Domain, Diverged Architecture**로 소개한다. GashaGame의 service-backed meta 경계와 VASSALIA의 standalone deterministic run을 비교하는 gameplay/client architecture case study다.

# Confirmed Facts Used

- GashaGame 개발과 server 구현이 먼저였고, 이후 gameplay 재미와 구조 검증을 위해 같은 50-unit domain의 VASSALIA를 제작했다.
- Unit ID, Cost, Lineage, Job은 50/50 일치하고 Display Name은 46/50 일치한다.
- GashaGame은 FastAPI/SQLAlchemy가 account, gacha, meta currency, formation, stage progression을 저장하며 battle simulation은 Unity client-local이다.
- GashaGame의 MVP server는 submitted victory를 deterministic replay하지 않는다.
- VASSALIA는 `DemoRunState`, `RunRandom`, `CombatSimulation` 중심의 standalone in-memory run이다.
- `EnemyEncounterSO`는 unit, star, equipment, board coordinate를 authoring하며 invalid/missing/duplicate data는 combat 전에 차단된다.
- 양쪽 C# compile은 0 errors다. GashaGame server tests는 20 passed / 1 failed이며 실패 원인은 manifest version drift다. VASSALIA deterministic validation log가 존재한다.

# Claims Intentionally Avoided

- same codebase / fork / online-offline version
- server-authoritative combat / secure battle validation / production-ready backend
- full replay system / full save-load
- all tests passed
- 모든 코드가 AInvil로 생성됐다는 주장, AI 작성 비율, 생산성 수치

# Media Still Needed

- GashaGame server response → local combat → result handoff GIF
- VASSALIA Encounter Inspector → board spawn → runtime battle GIF
- 동일 unit ID의 GashaGame / VASSALIA side-by-side capture
- full-bench atomic merge/purchase edge-case GIF
- 두 프로젝트의 gameplay hero footage

# Validation Performed

- Source symbol and retained-log cross-check completed.
- Existing candidate images visually inspected; two VASSALIA images accepted, GashaGame image limited to older transition evidence.
- All local HTML `href` / `src` paths resolve, and the four portfolio routes and CASE03 assets return successfully from a local HTTP server.
- Desktop browser QA at 1280px confirmed no horizontal overflow, no broken images, and no console warnings or errors on CASE01, CASE02, and CASE03.
- Mobile browser QA at 390×844 confirmed no horizontal overflow or broken images on the main page and all three case pages; CASE03 grids collapse as intended.
- Main-page CASE03 entry, global navigation, CASE02 → CASE03 pagination, CASE03 evidence disclosure, and CASE03 project pagination were exercised in-browser.

# Remaining Gaps

- 두 repository의 공통 Git ancestry나 shared production library는 확인되지 않았다.
- GashaGame의 최신 gameplay/Android footage가 없다.
- VASSALIA Encounter Play Mode 일부는 traceability 기록상 사실이며 이번 작업에서 재실행하지 않았다.
- Full run save/load와 completed replay system은 확인되지 않았다.
