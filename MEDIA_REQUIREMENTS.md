# 포트폴리오 미디어 준비 목록

이 문서는 현재 포트폴리오 HTML, 프로젝트별 콘텐츠 노트, 포트폴리오 초안에 언급된 미디어를 통합한 제작 체크리스트다.

상태 표기:

- **필수**: 현재 페이지에 빈 미디어 슬롯이 있거나 프로젝트 이해에 직접 필요한 자료
- **권장**: 페이지는 성립하지만 주장과 기술력을 더 명확히 증명하는 자료
- **보유**: 현재 `Portfolio/assets`에 있고 페이지에서도 사용 중인 자료

## 0. 공통 제작 규격

| 항목 | 권장 형태 | 규격 |
| --- | --- | --- |
| 대표 영상 | MP4(H.264), 필요 시 WebM 병행 | 1920×1080, 16:9, 30fps, 10–20초, 무음 자동재생을 고려해 자막 포함 |
| 기능 비교 영상 | MP4/WebM 권장, GIF는 짧은 보조본만 | 1920×1080 또는 1280×720, 5–12초, 전/후 상태와 핵심 수치를 화면에 표기 |
| 게임 스크린샷 | PNG 또는 고품질 WebP | 1920×1080, HUD가 읽히는 원본 비율 유지 |
| 코드·로그 증거 | PNG/WebP | 텍스트가 확대 없이 읽히도록 핵심 영역만 크롭, 비밀정보 제거 |
| 구조도·상태도 | SVG 또는 HTML/CSS | 벡터 우선, 모바일에서도 읽히도록 한 화면에 5–7개 노드 이하 |
| 차트·접촉 시트 | SVG/PNG | 범례, 단위, 데이터 출처, 측정 시점을 함께 표기 |
| 소셜 공유 이미지 | PNG/JPG | 1200×630, 프로젝트명·역할·대표 장면 포함 |

GIF로 적혀 있는 기존 슬롯도 실제 웹 게시용은 MP4/WebM이 더 적합하다. GIF는 파일 크기가 커지고 색과 프레임 품질이 떨어지므로 문서 공유용 보조본으로만 사용한다.

---

## 1. 사이트 공통

### 필수

| ID | 미디어 내용 | 형태 | 권장 파일명 | 사용 위치 |
| --- | --- | --- | --- | --- |
| COMMON-01 | 네 프로젝트의 성격이 한눈에 보이는 포트폴리오 대표 이미지. AInvil 그래프/Unity 화면, Action Required CCTV, VASSALIA 전투, SOE Debug Overlay를 4분할로 구성 | 1200×630 PNG/JPG | `portfolio-og.png` | 메인 페이지 OG 이미지, 링크 공유 썸네일 |
| COMMON-02 | 각 프로젝트의 핵심 화면과 프로젝트명을 담은 개별 공유 썸네일 4종 | 1200×630 PNG/JPG 4장 | `ainvil-og.png`, `action-required-og.png`, `gashagame-vassalia-og.png`, `soe-og.png` | 각 프로젝트 페이지 OG 이미지 |

### 권장

| ID | 미디어 내용 | 형태 | 권장 파일명 | 사용 위치 |
| --- | --- | --- | --- | --- |
| COMMON-03 | 네 프로젝트를 빠르게 훑는 30–45초 쇼릴. 프로젝트당 6–10초, 마지막에 역할과 연락처 표시 | MP4/WebM | `portfolio-showreel.mp4` | 메인 Hero 또는 이력서 링크용 |
| COMMON-04 | 메인 프로젝트 카드에 사용할 프로젝트별 대표 썸네일 | 16:10 WebP/PNG 4장 | `card-ainvil.webp` 등 | 메인 Projects 카드 배경/미리보기 |

---

## 2. Action Required

### 필수 — 현재 HTML의 빈 슬롯

| ID | 미디어 내용 | 형태 | 권장 파일명 | 사용 위치 |
| --- | --- | --- | --- | --- |
| AR-01 | 경비실에서 시작해 CCTV 확인 → 이상현상 관찰 → 인터컴 응답으로 이어지는 실제 플레이. 세 공간/기능이 모두 한 번씩 보여야 함 | 15초 MP4/WebM, 자막 포함 | `action-required-hero.mp4` | Hero |
| AR-02 | Screen 이상현상을 본 CAM에서 다른 CAM으로 이탈했다가 돌아왔을 때 진행 시간이 유지되는 모습과, Sound playhead가 같은 위치에서 재개되는 모습을 전/후 수치 오버레이로 비교 | 8–12초 비교 MP4/WebM | `screen-sound-continuity.mp4` | Case 02 |
| AR-03 | CCTV 6채널 UI와 실제 이상현상 한 사례. 채널 번호와 신고에 필요한 정보가 읽혀야 함 | 1920×1080 PNG/WebP | `action-required-cctv.png` | Result gallery |
| AR-04 | 1993년 경비실 전체 분위기. 모니터·신고서/노트·인터컴의 공간 관계가 한 장에 보여야 함 | 1920×1080 PNG/WebP | `action-required-guard-room.png` | Result gallery |
| AR-05 | 인터컴 통화 UI와 선택/판정 상황. 화자·응답 선택·상태를 읽을 수 있어야 함 | 1920×1080 PNG/WebP | `action-required-intercom.png` | Result gallery |

### 권장 — 사례의 증명력을 높이는 자료

| ID | 미디어 내용 | 형태 | 권장 파일명 | 사용 위치 |
| --- | --- | --- | --- | --- |
| AR-06 | CAM01/03/06에 서로 다른 anomaly instance가 동시에 존재하고, `Active ≥ 3` 타이머와 위험 화면 10초 타이머가 별도로 움직이는 장면 | 8–12초 MP4 또는 애니메이션 상태도 SVG | `multiple-anomalies-boundary.mp4` | Case 01 |
| AR-07 | 실제 한 ID가 Feature Spec의 Requirement → C# class/method → Acceptance/Validation 결과로 이어지는 추적 예시 | SVG 또는 합성 PNG | `action-required-traceability.svg` | Workflow / Technical Evidence |
| AR-08 | Pause에서 `0.5 → 0 → 0.5`가 복원되는 수치 비교와 Runtime TTS → pre-baked WAV로 바뀌면서 이전 증거가 무효화되는 revision 흐름 | 2패널 SVG/PNG | `pause-audio-evidence-boundary.svg` | Small Cases |
| AR-09 | 최신 pre-baked WAV 경로에서 한국어/영어 음성이 올바른 화자와 대사에 연결되는 실제 플레이 및 청취 검증 | 10–15초 MP4, 오디오 포함 | `intercom-wav-validation.mp4` | Small Cases / 검증 보완 |
| AR-10 | Selection outline의 남은 조건인 occlusion/depth, distance/scale, hard-edge/submesh, window/empty traversal을 통과하는 장면 | 짧은 테스트 모음 MP4 또는 4분할 contact sheet | `selection-full-ac-evidence.mp4` | Case 03 검증 상태 갱신용 |
| AR-11 | Windows x64 및 WebGL 빌드가 실제 실행되는 모습 | 2분할 PNG 또는 8초 MP4 | `action-required-builds.png` | Result |

### 보유

| ID | 미디어 내용 | 형태 | 현재 파일 |
| --- | --- | --- | --- |
| AR-E01 | Monitor 선택 시 raw mask | PNG | `assets/images/selection-mask-simple-raw.png` |
| AR-E02 | Intercom Channel03 선택 시 raw mask | PNG | `assets/images/selection-mask-intercom-raw.png` |
| AR-E03 | 선택 해제 시 black mask | PNG | `assets/images/selection-mask-clear-raw.png` |
| AR-E04 | Monitor의 최종 red outline | PNG | `assets/images/selection-final-simple.png` |
| AR-E05 | Intercom Channel03의 최종 red outline | PNG | `assets/images/selection-final-intercom.png` |

AR-01의 원본에서 AR-03~05를 스틸로 추출할 수 있다. 따라서 먼저 깨끗한 20–30초 원본 플레이를 촬영한 뒤 Hero 영상과 Result 이미지로 나누는 것이 효율적이다.

AR-01~05는 `assets/ActionRequired/`에 추가되어 Hero, Case 02, Result gallery에 연결되었다. 정적 결과 이미지는 실제 제공 형식인 JPG를 그대로 사용한다.

---

## 3. AInvil

현재 페이지의 구조도는 대부분 HTML/CSS로 이미 표현되어 있다. 아래 목록은 도식 자체를 다시 그리는 작업보다, 실제 도구가 동작한다는 증거를 보강하기 위한 캡처 중심이다.

### 필수

| ID | 미디어 내용 | 형태 | 권장 파일명 | 사용 위치 |
| --- | --- | --- | --- | --- |
| AINVIL-01 | Production State Graph/CLI 요약과 Unity Editor가 동시에 보이는 대표 장면. “문서/상태 → Unity 실행” 제품 정체성이 한눈에 보여야 함 | 16:10 PNG/WebP 또는 10초 MP4 | `ainvil-hero.png` | Hero |
| AINVIL-02 | 동일한 Requirement/Acceptance ID가 GDD 또는 Feature Spec, Implementation Task/Unity Target, Validation Evidence에 연결된 실제 예시 | 3열 합성 PNG 또는 SVG | `ainvil-id-trace.png` | How It Works |
| AINVIL-03 | 생성 시점의 실제 graph/traceability 수치(현재 `104 nodes / 122 edges / 41 missing links`)와 graph node/edge 일부 | 합성 PNG/WebP | `ainvil-graph-summary.png` | Production State Graph |
| AINVIL-04 | Unity bridge의 MCP tool list/health 응답과 Unity Console 0 errors 상태. 요청이 MCP → HTTP RPC → Unity main thread로 도달했음을 보여줘야 함 | 2–3패널 PNG/WebP | `ainvil-unity-bridge-proof.png` | Unity Execution Flow |
| AINVIL-05 | DRC seed 1001/2026/7777의 rooms, targets, reachable, duplicates, deterministic 결과와 5단계 gameplay screenshot을 한 장으로 묶은 contact sheet | 1920×1080 PNG/WebP | `ainvil-drc-evidence-contact-sheet.png` | Real Project |
| AINVIL-06 | Passed branch, `humanReviewRequired: true`, `publicReleaseReady: false`가 동시에 보이는 evidence JSON/리포트 캡처 | PNG/WebP | `ainvil-release-boundary.png` | Validation |

AINVIL-01~06은 `assets/ainvil/`에 생성되어 페이지에 연결되어 있다. 원본 JSON/PNG를 갱신한 뒤 `tools/ainvil-visuals/generate.ps1`을 실행하면 최신 상태로 다시 생성되며, AINVIL-04는 별도의 SHA-256 manifest와 verification receipt를 함께 만든다.

### 권장

| ID | 미디어 내용 | 형태 | 권장 파일명 | 사용 위치 |
| --- | --- | --- | --- | --- |
| AINVIL-07 | 설치된 plugin manifest와 `ainvil --help` 또는 주요 CLI command 목록 | 2패널 PNG/WebP | `ainvil-plugin-cli.png` | 프로젝트 개요 |
| AINVIL-08 | Developer / Host AI / AInvil이 각각 결정·구현·실행·검증에서 맡는 책임 | SVG 또는 HTML/CSS swimlane | `ainvil-responsibility-swimlane.svg` | Development Method |
| AINVIL-09 | graph embedded evidence와 최신 standalone evidence가 불일치하는 실제 사례, 최신 harness failure, 다음 조치 | 3패널 PNG/WebP | `ainvil-known-limit-evidence.png` | Current Limits |
| AINVIL-10 | 현재 Limit → Risk → Next Work를 잇는 로드맵 | SVG 또는 HTML/CSS | `ainvil-roadmap.svg` | Current Limits |
| AINVIL-11 | Dungeon Recovery Company는 Tooling/Evidence, Action Required는 Methodology/Production Application으로 구분한 적용 수준 | 비교표 SVG 또는 HTML/CSS | `ainvil-applied-projects.svg` | Applied Projects |
| AINVIL-12 | AInvil이 실제로 명령을 받아 graph를 검사하고 Unity compile gate와 Play Mode evidence를 만드는 전체 흐름 | 20–30초 데모 MP4, 자막 포함 | `ainvil-workflow-demo.mp4` | Hero 하단 또는 별도 Demo |

### 이미 HTML/CSS로 구현된 미디어

- Intent to Evidence 수직 흐름도
- Production Flow 7단계 도식
- Host AI → MCP → HTTP RPC → Unity Main Thread 도식
- Requirement → Task/Acceptance → Unity Target/Evidence graph 도식
- Compile Gate → Play Mode → Runtime Hook → Assertion → Evidence 도식
- DRC runtime trace 및 seed 결과 카드

이 도식들은 반응형 텍스트 미디어이므로 별도 PNG로 바꿀 필요가 없다. 발표 자료나 PDF가 필요할 때만 SVG/PNG로 export한다.

---

## 4. GashaGame / VASSALIA

### 필수

| ID | 미디어 내용 | 형태 | 권장 파일명 | 사용 위치 |
| --- | --- | --- | --- | --- |
| GV-01 | 두 프로젝트의 핵심 gameplay를 연속 또는 좌우 분할로 보여주는 대표 영상. GashaGame의 server-backed meta 흐름과 VASSALIA의 route/shop/battle을 구분해 표기 | 15–20초 MP4/WebM | `gashagame-vassalia-hero.mp4` | Hero |
| GV-02 | GashaGame에서 서버 응답 수신 → Unity local combat 실행 → 전투 결과를 서버에 전달하는 경계. 서버 로그/응답과 게임 화면을 함께 표시 | 10–15초 MP4/WebM | `gashagame-result-handoff.mp4` | Case 01 |
| GV-03 | VASSALIA Encounter Inspector에서 unit/star/equipment/board coordinate를 작성 → 검증 → board spawn → runtime battle로 이어지는 과정 | 10–15초 MP4/WebM | `vassalia-encounter-runtime.mp4` | Case 03 |
| GV-04 | bench가 가득 찬 상태에서 A+A+A 구매를 계획하고 merge한 뒤 공간이 생기며 거래가 commit되는 edge case | 6–10초 MP4/WebM | `vassalia-atomic-purchase.mp4` | Atomic Economy |
| GV-05 | 동일 unit ID 한 개를 골라 GashaGame과 VASSALIA의 ID, cost, lineage, job, display name을 좌우에서 비교 | Side-by-side PNG/WebP | `shared-unit-id-comparison.png` | Shared Domain |

GV-01~05는 `assets/Vassilia&GashaGame/`에 추가되어 Hero, Shared Domain, State Ownership, Authored Encounter, Atomic Economy에 연결되었다.

### 권장

| ID | 미디어 내용 | 형태 | 권장 파일명 | 사용 위치 |
| --- | --- | --- | --- | --- |
| GV-06 | 동일 seed와 input을 ×1 및 고속 simulation으로 실행했을 때 같은 결과가 나오는 비교 | 8–12초 split-screen MP4 | `vassalia-determinism-speed-compare.mp4` | Deterministic Gameplay |
| GV-07 | GashaGame 서버 소유 상태와 Unity client-local combat, VASSALIA의 local aggregate를 비교하는 상태 소유권 구조 | SVG 또는 HTML/CSS | `gasha-vassalia-state-ownership.svg` | Project Relationship / Case 01 |

### 보유

| ID | 미디어 내용 | 형태 | 현재 파일 |
| --- | --- | --- | --- |
| GV-E01 | VASSALIA 16-floor seeded route runtime UI | PNG | `assets/case03/hero/vassalia-route-runtime.png` |
| GV-E02 | GashaGame Android Main Story Stage 01 전환. 최신 gameplay가 아닌 과거 전환 증거로만 사용 | PNG | `assets/case03/evidence/gashagame-main-story-transition.png` |
| GV-E03 | VASSALIA unit-pool/shop runtime UI | PNG | `assets/case03/gameplay/vassalia-unit-pool-card.png` |

---

## 5. SOE

SOE에는 포트폴리오만을 위한 게임 내부 녹화 기능을 추가하지 않는다. 보스 컴뱃도 별도 미디어 제작 대상으로 두지 않는다. 환경과 telemetry에서 필요한 시각화는 일회성 `Portfolio` 기능이 아니라 개발 중 계속 사용할 수 있는 `Debug Overlay`로 구현한다.

### 필수 — Debug Overlay 기능과 결과 화면

| ID | 미디어 내용 | 형태 | 권장 파일명 | 사용 위치 |
| --- | --- | --- | --- | --- |
| SOE-01 | **Environment Debug Overlay.** 현재 player chunk 좌표, 주변 3×3 chunk의 active/inactive 상태, enemy의 현재·이전 chunk, relocation 발생 횟수와 사유를 runtime 화면에 표시한다. 개발·검증 중 토글할 수 있어야 하며 포트폴리오 전용 명칭이나 의존성을 사용하지 않는다. | 게임 내 Debug Overlay 기능 + 대표 PNG/WebP | `soe-environment-debug-overlay.png` | Environment |
| SOE-03 | **Telemetry Debug Overlay.** 현재 DPS, 회복, 피격 피해, 스킬별 누적 damage, 측정 시간과 CSV write 상태를 runtime HUD에 표시한다. CSV/차트와 동일한 필드명을 사용해 화면 값과 기록 값의 대응을 확인할 수 있게 한다. | 게임 내 Debug Overlay 기능 + 대표 PNG/WebP | `soe-telemetry-debug-overlay.png` | Telemetry |

### 권장

| ID | 미디어 내용 | 형태 | 권장 파일명 | 사용 위치 |
| --- | --- | --- | --- | --- |
| SOE-04 | Stage1 전체 구성, 플레이어, 다수 적, 스킬 효과가 보이는 실제 runtime overview | 1920×1080 PNG/WebP | `soe-stage1-overview.png` | Hero 또는 Result |
| SOE-05 | Fire × Earth mixed skill이 발동되고 피해/효과가 적용되는 장면 | 6–10초 MP4/WebM | `soe-fire-earth-skill.mp4` | Small Cases |
| SOE-06 | 초기 prototype의 실제 보존 자료가 발견될 경우 핵심 구조를 보여주는 역사적 화면. 현재 source가 없으므로 재현 이미지나 현 production 화면을 prototype이라고 표기하면 안 됨 | 원본 screenshot/video만 | `soe-early-prototype-original.*` | Project Timeline |

SOE-01과 SOE-03의 실행 영상은 각각 `assets/SOE/soe-stage1-chunk-runtime.mp4`, `assets/SOE/soe-telemetry-sync.mp4`로 연결되었다. 별도로 제공된 boss runtime contract 영상과 Stage1 overview도 Boss Combat 및 Result 섹션에 배치했다.

### 보유

| ID | 미디어 내용 | 형태 | 현재 파일 |
| --- | --- | --- | --- |
| SOE-E01 | 숲과 Spider Queen이 배치된 팀 제작 key art. gameplay capture가 아니며 현재처럼 팀 소유임을 명시해야 함 | PNG | `assets/case04/hero/soe-forest-key-art.png` |

---

## 6. 우선 제작 순서

### 1순위 — 페이지의 빈칸 제거

1. AR-01~05
2. GV-01~05
3. SOE-01, SOE-03 Debug Overlay
4. AINVIL-01~06

### 2순위 — 채용 담당자가 기술 주장을 확인할 수 있게 보강

1. AR-06~09
2. GV-06
3. AINVIL-07~09
4. SOE-04~05

### 3순위 — 배포와 공유 품질

1. COMMON-01~02
2. COMMON-03~04
3. AINVIL-10~12
4. AR-10~11

## 7. 최소 공개 세트

시간이 부족할 때도 아래 12개는 우선 확보한다.

- Action Required: AR-01~05
- GashaGame / VASSALIA: GV-01~03
- SOE: SOE-01, SOE-03 Debug Overlay
- AInvil: AINVIL-01, AINVIL-05

이 세트는 각 페이지의 대표 화면, 핵심 구현 사례, 실제 실행 증거를 최소 한 번씩 보여준다. 공통 OG 이미지는 위 자료의 스틸을 재조합해 만들 수 있다.

## 8. 촬영 시 공통 주의사항

- Unity Console, 서버 터미널, 파일 경로에 사용자명·토큰·내부 URL·개인정보가 노출되지 않게 한다.
- SOE에는 게임 내부 녹화 기능을 추가하지 않는다. 필요 시 운영체제의 화면 캡처 도구로 Debug Overlay 결과만 기록한다.
- 영상 시작 1초 안에 “무엇을 검증하는 장면인지” 제목을 표시한다.
- 포인터만 움직이는 영상보다 입력 → 상태 변화 → 결과가 한 장면 안에서 끝나도록 촬영한다.
- debug overlay는 기술 증거 영상에는 켜고, Hero/Result용 깨끗한 장면에는 끈다.
- 팀 프로젝트 미디어에는 `MY CODE`, `TEAM ASSET`, `INTEGRATION` 경계를 캡션으로 구분한다.
- 기존 기록만 있는 기능을 새로 실행하지 않았다면 `RECORDED EVIDENCE`, 새로 재검증했다면 `FRESH CAPTURE`로 구분한다.
- 음악이 핵심이 아닌 영상은 무음 자동재생을 기본으로 하고, 오디오 검증 영상 AR-09만 명시적으로 소리를 제공한다.
