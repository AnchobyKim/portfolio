# Action Required

## 01 HERO

1993년 아파트 경비실을 배경으로 한 CCTV 감시 호러 게임.

`Unity 6 · C# · URP · Input System`  
`Solo Development · 2026.08.14 — 2026.09.02`

**Built with AInvil + Unity MCP · Tooling + Workflow Application**

## 02 GAME

1993년 아파트 경비실에서 CCTV와 인터컴을 확인하며 이상현상을 분류한다. 여러 사건의 누적과 특정 위험 행동은 서로 다른 실패 조건으로 작동한다.

`ROOM → CCTV → OBSERVE → REPORT ↺`

## 03 DEVELOPMENT WORKFLOW

Action Required는 AInvil plugin/runtime과 Unity MCP를 실제 제작 과정에 사용한 프로젝트다. 게임 규칙을 요구사항과 기능 책임으로 정리하고, Host AI의 구현과 Unity 실행·검증을 같은 작업 흐름으로 연결했다.

`Game Rule → Function Mapping → Host AI Implementation → Unity MCP Execution → Validation / Revision`

## 04 CASE 01 — MULTIPLE ANOMALIES

화면 상태가 아니라 사건 identity를 셌다. 여러 CAM의 사건이 신고 전까지 동시에 남도록 single-active 구조를 고유 instance 기반으로 바꿨다.

```text
Active ≥ 3 · 299s → Alive
Active ≥ 3 · 300s → Game Over
3 → 2             → Timer Reset
```

| Developer | Codex (Host AI) | Validation |
| --- | --- | --- |
| 사건 identity, 실패 조건, 경계값 | 구조 변경, timer, debug hook | 경계값 재현, runtime evidence |

## 05 CASE 02 — UI LIFETIME ≠ GAME STATE LIFETIME

CCTV UI가 닫히는 것과 이상현상 instance가 끝나는 것은 같은 사건이 아니다. Screen 진행도와 Sound playhead의 owner를 UI GameObject에서 anomaly instance로 옮겼다.

## 06 CASE 03 — COMPILE PASS ≠ VISUAL PASS

컴파일 성공은 화면 성공이 아니다.

```text
Selection → Mask Pass → Composite → Visual Failure
          → MaskOnly diagnostic using production R8 TextureHandle
          → raw white/black 확인 → Final outline 확인
```

| Check | Latest result |
| --- | --- |
| C# compile | 0 errors |
| Mask / debug / composite shaders | 0 messages/errors |
| Console | 0 errors |
| MaskOnly Monitor | renderer 1, draws 4, white 255 / black 0, PASS |
| MaskOnly Intercom Channel03 | renderers 2, draws 2, Channel03 only, white 255 / black 0, PASS |
| Selection clear | draws 0, black 0, PASS |
| Final Monitor | red outline, full silhouette, no interior tint, PASS |
| Final Intercom | Channel03 only outline, no whole-object bleed or interior tint, PASS |

`Case C: MaskOnly correct + Final correct`

초기 MaskOnly 흰색은 post-processing 때문에 약 RGB(197,208,218)로 측정됐다. 진단 scheduling만 `AfterRenderingPostProcessing`으로 옮겼고 production Final은 바꾸지 않았다. 재실행에서 정확한 white 255 / black 0을 확인했다.

검증한 분기는 PASS지만 Full `AC-PROP-005`는 Partially Covered / Pending이다. 남은 범위는 occlusion/depth, distance/scale ±1 px, hard-edge/submesh continuity, window/empty traversal이다.

실제 증거:

- `assets/images/selection-mask-simple-raw.png`
- `assets/images/selection-mask-intercom-raw.png`
- `assets/images/selection-mask-clear-raw.png`
- `assets/images/selection-final-simple.png`
- `assets/images/selection-final-intercom.png`

## 07 SMALL CASES

- Exact restore: `0.5 → Pause(0) → 0.5 ✓`
- Old evidence ≠ new evidence: Runtime TTS에서 pre-baked WAV로 구조가 바뀐 뒤 이전 검증을 재사용하지 않았다.

## 08 RESULT

19일의 솔로 개발로 CCTV 관찰, 인터컴 판정, 다중 이상현상, 신고와 실패 조건을 하나의 플레이 루프로 완성했고 Windows x64와 WebGL 빌드 기록을 남겼다.

## 09 TECHNICAL EVIDENCE

| Case | Design | Code | Validation |
| --- | --- | --- | --- |
| Multiple anomalies | `REQ-OBS-003/007/008/015` | `AnomalyScheduler`, `CctvController`, `GuardRoomDebugHooks` | `AC-OBS-010~016`; 일부 pending |
| Screen / Sound | `REQ-OBS-003/007/008` | `AnomalyScheduler.ScreenElapsedSeconds`, `SoundAnomalyController` | `AC-OBS-017/018`; Runtime Tested |
| Selection mask | `REQ-PROP-005`, `TASK-PROP-004` | `SelectionSilhouetteRendererFeature`, `SelectionHighlightRegistry` | `VAL-PROP-005-MASK-SIMPLE / CLEAR / INTERCOM`; tested branches PASS, full AC Partial/Pending |
| Pause | `REQ-UI-PAUSE-001~005` | `PauseMenuController` | `VAL-UI-PAUSE-001~005`; Runtime Tested |
| Intercom | `REQ-INTERCOM-001~015` | `IntercomController`, conversation JSON, 90 WAV | Core User Confirmed; 새 audio path pending |

Action Required는 AInvil plugin/runtime과 Unity MCP를 실제 제작에 사용했다. 구체적인 버전·호출 횟수·전체 코드 중 생성 비율은 추정하지 않는다.
