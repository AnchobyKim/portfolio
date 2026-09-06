# Action Required

## Hero

**야간 경비실에서 여섯 CCTV와 인터컴을 관리하며 이상현상을 판별하는 1인칭 관찰 게임.**

- Unity 6 · C# · URP · Input System
- Solo Development
- 개발 기간: 2026-08-14 — 2026-09-02
- **Built with AInvil + Unity MCP · Tooling + Workflow Application**

추천 시각 자료: CCTV 화면, 경비실, 인터컴이 한 번씩 보이는 15초 gameplay GIF.

## Project Overview

플레이어는 23:30에 근무를 준비하고 00:00부터 06:00까지 CCTV, 신고서, 인터컴을 오간다. 이상현상은 발견만으로 사라지지 않으며 채널과 유형을 맞춰 신고해야 한다. 세 사건을 오래 방치하거나 위험한 화면을 계속 보면 근무가 끝난다.

코드는 `GuardRoomBootstrap`의 명시적 초기화 순서 아래 게임 흐름, 시간, 이상현상, CCTV, 오디오, 인터컴, 입력, UI를 나눴다. 설계 문서의 ID는 실제 component와 검증 기록을 가리킨다.

- 추천 시각 자료: Room / Monitor / Notebook / Intercom 상태를 표시한 gameplay loop
- 기술 근거: `Assets/Scripts/Core/GuardRoomBootstrap.cs`, `Assets/Docs/Demo_GDD.md`, `Assets/Docs/Demo_Technical_Design.md`

## AInvil Integration

**Tooling + Workflow Application**

개발자 확인에 따라 Action Required는 AInvil plugin/runtime과 Unity MCP를 실제 제작 과정에 사용한 프로젝트로 정리한다. Game Design→Requirement Analysis→Function Mapping→Implementation→Unity Execution→Validation 흐름이 문서 ID, 코드 대상, 검증 기록과 연결된다. 다만 사용 버전, 호출 횟수, 전체 코드 중 생성 비율, 당시 PSG node 구성을 현재 상태에서 역추정하지 않는다.

| AInvil Method / Capability | Action Required 실제 증거 | 연결 수준 |
| --- | --- | --- |
| Game Design | `Assets/Docs/Demo_GDD.md` | Level 1 · 문서 |
| Technical Design | `Assets/Docs/Demo_Technical_Design.md` | Level 1 · 문서 |
| Requirement | `REQ-OBS-*`, `REQ-PROP-*`, `REQ-INTERCOM-*` in Feature Specs | Level 1 · ID |
| Task | `TASK-OBS-*`, `TASK-PROP-*`, `TASK-INTERCOM-*` | Level 1 · ID |
| Acceptance Criteria | `AC-OBS-*`, `AC-PROP-005`, `AC-INTERCOM-*` | Level 1 · ID |
| Structured Memory | GDD, specs, contracts, traceability, validation Markdown 집합 | 제작 문맥과 책임 매핑 |
| Unity Automation | Unity MCP를 통한 Editor 실행 | 직접 사용 · 개발자 확인 |
| Debug Hook | `GuardRoomDebugHooks.ExecuteEditorCommand`, anomaly/intercom 명령 | Level 1 · 프로젝트 내부 도구 |
| Runtime Validation | `AC-OBS-016~019`, `VAL-UI-PAUSE-001~005`와 Play Mode 기록 | Level 1 · 기록상 사실 |
| Visual Validation | MaskOnly raw와 Final 화면에서 Monitor / Intercom / clear 분기 PASS, 전체 AC는 partial/pending | Compile + Runtime/Visual Tested · 실제 capture 보존 |
| Evidence | `Validation_Report.md`, `Intercom_Validation_Evidence.md` | Level 1 · Markdown; AInvil evidence JSON 아님 |
| Human Approval | Intercom core `User Confirmed`; 새 WAV revision은 미검증으로 분리 | Level 1 · 승인 경계 |

추천 시각 자료: 위 표를 12단계가 아닌 `Design / Build / Validate / Approve` 네 묶음으로 압축한 그림.

## How AInvil Was Used

게임 규칙과 기능 책임을 정리한 뒤 Host AI의 구현, Unity MCP 실행, runtime/visual evidence 확인으로 이어지는 제작 루프에 AInvil plugin/runtime을 사용했다.

```text
Design Rule
    ↓
Technical Requirement + Owner
    ↓
AI-assisted Implementation
    ↓
Unity Debug Hook / Input / Capture
    ↓
Acceptance Result + Revision
```

예를 들어 `REQ-OBS-003/007/008`은 `AnomalyScheduler`, `CctvController`, `SoundAnomalyController`에 연결되고, `AC-OBS-016~019`는 동일한 규칙의 runtime 결과를 기록한다. 코드 작성 주체를 줄 단위로 분리하지 않으며 게임 규칙과 최종 채택은 개발자의 결정으로 남긴다.

- 추천 시각 자료: 실제 ID 하나가 Spec→Class→Validation으로 이어지는 추적도
- 기술 근거: `Assets/Docs/Unity_Traceability_Matrix.md:52-53`, `Assets/Docs/Anomaly_Content_Feature_Spec.md`

## Case 01

### 복수 이상현상 — 화면 상태가 아니라 사건 identity를 셌다

최종 규칙은 여러 CAM의 이상현상이 신고 전까지 동시에 남아야 했다. 단일 active 상태를 고유 `instanceId`를 가진 `List<ActiveAnomaly>`로 바꾸고, 재관찰은 사건 수가 아닌 관찰 상태만 바꾸도록 정했다.

```text
규칙 변경
  → 고유 instanceId + CAM별 1개 제한
  → anomaly cam/type/variant debug command
  → 3개·300초 overlap / danger 10초 경계 검증
```

`AnomalyScheduler`는 생성·신고·중첩 시간을 맡고, `CctvController`는 실제 위험 이미지가 표시된 연속 시간을 맡는다. `GuardRoomDebugHooks`로 CAM, 유형, variant, danger를 직접 구성했다. `AC-OBS-010/011`은 300초 직전·도달·reset을, `AC-OBS-012/014`는 10초 위험 주시와 이탈 reset을 분리했다. GameOver 미신고 목록은 `AC-OBS-015`에서 8/8 runtime pass로 기록됐다.

- 상태: 복수 identity와 경계값은 deterministic/runtime 기록 있음. 위험 화면의 최종 사용자 Play Mode 확인은 일부 pending.
- 추천 시각 자료: 세 CAM의 서로 다른 instance와 두 타이머를 함께 보여주는 GIF 또는 state diagram
- 기술 근거: `AnomalyScheduler.cs`, `CctvController.cs`, `GuardRoomDebugHooks.cs`, `Anomaly_Content_Feature_Spec.md`

## Case 02

### Screen / Sound — UI lifetime ≠ game state lifetime

CCTV나 책을 닫는 일은 UI 전환이고, 이상현상이 끝나는 일은 게임 규칙이다. 재생 객체의 enable/disable에 진행 상태를 맡기지 않고 anomaly instance가 시간을 소유하도록 바꿨다.

```text
Screen: 첫 노출 전 0x → 해당 CAM 1x → 노출 후 다른 화면 0.25x
Sound:  first-start gate → instance별 playhead 저장 → pause/resume
```

`ScreenElapsedSeconds`는 화면을 다시 열어도 누적 위치를 유지했다. Sound는 잘못된 CAM에서 처음 시작하지 않고, 시작한 뒤 다른 CAM에서는 잠시 멈추더라도 같은 instance와 playhead를 보존했다. `AC-OBS-017`은 `0 / 1.0 / 0.25`를, `AC-OBS-018`은 pause/resume 후 `10.29477` 재개를 기록했다.

- 상태: Runtime Tested. 주관적 청취와 최종 화면 미감은 별도 확인 항목.
- 추천 시각 자료: CAM 이탈·복귀 전후 Screen time과 Sound playhead를 오버레이한 비교 GIF
- 기술 근거: `AnomalyScheduler.cs:98-105,157-165`, `SoundAnomalyController.cs:115-244`, `CctvController.cs`, `AC-OBS-017/018`

## Case 03

### RenderGraph Highlight — Compile Pass ≠ Visual Pass

선택 대상 registry, renderer mask 복원, raycast 안정성, shader compile은 통과했다. 그러나 1920×1080 capture에서 빨간 outline은 보이지 않았다. 이 결과를 완료로 바꾸지 않았다.

```text
HLSL type mismatch
  → Compile Fail
  → float4 수정 / Compile Pass
  → 첫 capture: Fail (Visual)
  → RenderGraph UseTexture + 명시적 mask binding
  → 두 번째 capture: Fail (Visual)
  → 직접 renderer/submesh draw + global uniform 수정
  → MaskOnly raw white/black 확인 / Final outline 확인
```

`SelectionSilhouetteRendererFeature`는 transient mask를 `UseTexture`로 선언하고 registry의 renderer/submesh를 직접 그린다. window와 151-renderer Intercom 사이에서 selection bit 복원과 raycast hit는 동일했다. 구현 상태와 플레이어가 실제로 보는 결과를 다른 acceptance로 유지했다.

- 상태: Monitor와 Intercom Channel03의 Final outline 분기는 PASS. Full AC-PROP-005는 occlusion/depth, distance/scale ±1 px, hard-edge/submesh continuity, window/empty traversal이 남아 Partially Covered / Pending.
- 시각 자료: 실제 MaskOnly raw 3장과 Final outline 2장
- 기술 근거: `SelectionSilhouetteRendererFeature.cs`, `SelectionHighlightRegistry.cs`, `VAL-PROP-005-H/I`, `AC-PROP-005`

## Small Cases

### Pause — 원래 값을 돌려주는지 확인

```text
Time.timeScale: 0.5 → 0 → 0.5
```

`PauseMenuController`는 열기 직전 `Time.timeScale`과 `AudioListener.pause`를 저장한다. Intercom에서 일부러 기본값이 아닌 `0.5`를 넣어 Resume이 `1`을 하드코딩하지 않는지 검사했다. 네 mode의 Pause/Resume과 Fan/Sound playhead 보존은 Runtime Tested다. Settings dropdown의 일부 화면 검증은 별도 pending이다.

### Intercom — 구현 revision이 바뀌면 과거 증거도 분리

```text
Runtime TTS: User Confirmed
        ↓ architecture changed
Pre-baked WAV: 90 files implemented
        ↓
old TTS evidence ≠ current WAV playback evidence
```

기존 core FSM과 입력 순서는 2026-08-30 `User Confirmed`다. 이후 배포 재현성을 위해 caller audio를 runtime TTS에서 한국어 45개·영어 45개의 pre-baked WAV로 바꿨다. `Intercom_Validation_Evidence.md`는 이전 Caller TTS pass를 새 audio path의 증거로 쓰지 말라고 명시한다. 최신 WAV revision의 runtime·청취 검증은 `Pending`이다.

추천 시각 자료: Pause 수치 비교 카드와 Intercom evidence revision timeline.

## Result

Action Required에는 설계 규칙, component owner, debug 재현 경로, acceptance 결과가 같은 ID 체계로 남아 있다. Windows x64와 WebGL 빌드 성공 기록도 존재한다.

포트폴리오의 결과는 “AI가 게임을 만들었다”가 아니다. 개발자가 규칙과 실패 기준을 정하고, AI-assisted implementation을 실제 Unity 상태와 비교하며, 실패·보류·폐기된 증거를 완료와 분리한 제작 기록이다.

- 확인된 빌드: Windows x64, WebGL
- 대표 runtime evidence: 복수 이상현상, Screen/Sound continuity, Pause lifecycle
- 공개 전 남은 대표 확인: selection outline의 전체 AC 잔여 범위, pre-baked Intercom 청취, 일부 standalone/display matrix
- 추천 시각 자료: 게임 대표 장면 3개와 `Passed / Failed / Pending` evidence strip

## Technical Evidence

| Case | Design / Requirement | Implementation | Validation |
| --- | --- | --- | --- |
| 복수 이상현상 | `Anomaly_Content_Feature_Spec.md` · `REQ-OBS-003/007/008/015` | `AnomalyScheduler`, `CctvController`, `GuardRoomDebugHooks` | `AC-OBS-010~016`, `Validation_Report.md` |
| Screen / Sound | `REQ-OBS-003/007/008` | `AnomalyScheduler.ScreenElapsedSeconds`, `SoundAnomalyController` | `AC-OBS-017/018`, playhead `10.29477` |
| Highlight | `REQ-PROP-005`, `TASK-PROP-004` | `SelectionSilhouetteRendererFeature`, `SelectionHighlightRegistry` | MaskOnly / Final tested branches PASS; Full AC Partially Covered / Pending |
| Pause | `REQ-UI-PAUSE-001~005` | `PauseMenuController` | `VAL-UI-PAUSE-001~005` |
| Intercom | `REQ-INTERCOM-001~015` | `IntercomController`, conversation JSON, 90 WAV | core `User Confirmed`; 새 audio path pending |

저장소 기준 경로:

- 설계: `Assets/Docs/Demo_GDD.md`, `Demo_Technical_Design.md`, `Component_Contracts.md`, `Input_Spec.md`
- 추적성: `Assets/Docs/Unity_Traceability_Matrix.md`
- 검증: `Assets/Docs/Validation_Report.md`, `Intercom_Validation_Evidence.md`
- 구현: `Assets/Scripts/Core`, `Assets/Scripts/Observation`, `Assets/Scripts/Audio`, `Assets/Scripts/Rendering`, `Assets/Scripts/UI`

검증 메모: 이 초안은 저장된 코드와 문서를 교차 조사한 결과다. 이번 작업에서 Unity Play Mode를 다시 실행하지 않았으며, 기존 runtime 결과는 **기록상 사실**로 표기했다.
