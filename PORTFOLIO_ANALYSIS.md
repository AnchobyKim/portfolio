# Geummongnyeon Apartments / Action Required — AI 활용 포트폴리오 사전 분석

> 작성일: 2026-09-05  
> 분석 대상: Unity 프로젝트 루트(`GeummongnyeonApartments`)  
> 목적: 최종 포트폴리오에 넣을 사례를 고르기 위한 근거 문서. 이 문서는 최종 포트폴리오가 아니다.

## 분석 원칙과 증거 수준

이 분석은 현재 저장소의 코드·설계 문서·검증 보고서·설정·빌드 산출물과 현재 작업에서 접근 가능한 Codex 작업 기록을 사용했다. 원문 대화나 과거 프롬프트를 저장소에서 발견하지 못했으므로 프롬프트를 재현하지 않는다.

- **확인 사실**: 현재 파일, 설정, 산출물 또는 명시적인 검증 기록으로 확인했다.
- **기록상 사실**: 프로젝트 문서에 적혀 있으나 이번 조사에서 같은 절차를 다시 실행하지 않았다.
- **추론**: 구조나 문서 흐름에서 읽을 수 있는 가능성이다. 개발자의 당시 판단으로 확정하지 않는다.
- **확인 필요**: 자료끼리 충돌하거나 개발자의 설명 없이는 주체·의도를 가를 수 없다.
- 검증 상태는 `Implemented`, `Compile Verified`, `Runtime Tested`, `Visual Validated`, `User Validated`, `Pending / Not Verified`로 구분한다.

개발자가 이번 작업에서 직접 확인한 정보는 다음과 같다.

- 개인 프로젝트다.
- 실제 개발 기간은 2026-08-14부터 2026-09-02까지다.
- 개발자는 전체 개발 범위를 담당했고, 상당수 구현과 문제 해결에 AI 코딩 에이전트를 사용했다.
- 생성 이미지에는 Nano Banana, 음원에는 Pixabay 무료 음원, TTS에는 Windows 기본 TTS를 사용했다.

다만 저장소만으로 특정 메서드나 줄을 사람 또는 AI가 단독 작성했다고 분리할 수는 없다. 최종 문서에서도 코드 저자 비율을 추정해서는 안 된다.

## 1. 저장소 조사 결과

### 1.1 구조와 규모

| 영역 | 확인 내용 | 근거 |
| --- | --- | --- |
| 엔진 | Unity `6000.5.0f1` | `ProjectSettings/ProjectVersion.txt` |
| 렌더링·입력 | URP 17.5.0, Input System 1.19.0 | `Packages/manifest.json`, `Packages/packages-lock.json` |
| 런타임 코드 | `Assets/Scripts` 아래 자체 C# 84개, 물리 16,317줄, 비어 있지 않은 줄 14,754줄 | 2026-09-05 파일 직접 집계. `Library`, `Temp`, `Logs`, `Build`, `Builds`, `Packages` 제외 |
| 제작 도구 | Editor C# 13개, Debug C# 1개, Diagnostics C# 3개 | `Assets/Scripts/Editor`, `Debug`, `Diagnostics` 직접 집계 |
| 자동화 테스트 | 테스트용 C#과 `.asmdef`를 발견하지 못함 | `Assets` 아래 파일명·구조 검색 |
| 성능 계측 | `ProfilerMarker`, `FrameTiming`, 벤치마크·성능 테스트 코드를 발견하지 못함 | `Assets/Scripts` 검색 |
| 프롬프트 저장 | 프로젝트 소유의 prompt/chat/Codex 기록 파일을 발견하지 못함 | `Assets`, `ProjectSettings` 검색. 패키지 캐시와 생성 임시 파일 제외 |
| Git | 유효한 Git 저장소가 아님 | 프로젝트와 상위 경로에서 `git rev-parse` 실패. 발견된 상위 `.git` 경로는 빈 디렉터리 |
| Windows 빌드 | Windows x64 빌드 성공 기록과 실행 파일 존재 | `Assets/Docs/Validation_Report.md:10-24`, `Builds/Windows/Action Required.exe` |

코드량은 저장소 범위를 설명하는 보조 수치다. AI가 만든 코드의 양이나 개발자 역량의 성과 지표로 사용하지 않는 편이 낫다.

### 1.2 주요 시스템과 의존관계

`GuardRoomBootstrap`이 저장된 씬의 `Systems`, `Environment`, `PlayerRig`, UI 참조를 검사하고 주요 객체를 연결한다. 한 줄의 초기화 순서에는 게임 흐름, 시간, 이상현상, CCTV, 오디오, 인터컴, 시나리오, 입력, UI, 자막, 시네마틱, 디버그 훅이 명시되어 있다. 런타임 임의 탐색보다 직렬화 참조와 명시적인 `Initialize`/`Bind` 호출을 사용한다.

| 시스템 | 주 책임 | 주요 연결 | 핵심 근거 |
| --- | --- | --- | --- |
| 게임 흐름 | 모드 전환, 실패·승리, 기기 열기/닫기 | 시간, 이상현상, 입력, UI | `Assets/Scripts/Core/GameFlowController.cs` |
| 시간·시나리오 | 23:30 준비, 00:00~06:00 근무, 시간대 이벤트 | 흐름, 환경, 인터컴, 시네마틱 | `ShiftClock.cs`, `DemoScenarioController.cs`, `Demo_GDD.md` |
| 이상현상 | 고유 인스턴스, 생성 제한, 관찰·보고, 중첩 실패 | CCTV, Sound, 흐름 | `AnomalyScheduler.cs`, `Anomaly_Content_Feature_Spec.md` |
| CCTV | 6개 채널, 콘텐츠 선택, Screen 진행, 위험 주시 | 이상현상, VHS 렌더링 | `CctvController.cs`, `CctvContentCatalog.cs` |
| Sound 이상현상 | 최초 재생 게이트, 재생 위치, 음량·무음 상태 | 이상현상, CCTV, 오디오 믹스 | `SoundAnomalyController.cs` |
| 인터컴 | 통화 상태와 입력 순서, 방문자·보고 연동 | 흐름, CCTV, 이상현상, 자막·음성 | `IntercomController.cs`, `IntercomConversationData.cs`, JSON catalog |
| Pause·설정 | 모드 보존, `Time.timeScale`, 오디오 pause, 입력 우선순위 | 흐름, 입력, 설정 서비스 | `PauseMenuController.cs`, 관련 Feature Spec |
| 선택 피드백 | 선택 registry, URP RenderGraph mask/composite | raycast, 렌더러 feature | `SelectionHighlightRegistry.cs`, `SelectionSilhouetteRendererFeature.cs` |
| 로컬라이징·접근성 | 한·영 텍스트, 자막 이력, 화면·음량 설정 | UI, 인터컴, Sound | `LocalizedTextService.cs`, `SubtitleService.cs`, 설정 코드 |
| 검증·진단 | 정확한 상태 구성, 콘솔 명령, 실행 로그, 버그 보고 | 대부분의 런타임 시스템 | `GuardRoomDebugHooks.cs`, `RunLogService.cs`, `BugReportSubmissionService.cs` |

핵심 연결 근거는 `Assets/Scripts/Core/GuardRoomBootstrap.cs:14-100`이다. 이 파일은 시스템 책임을 새로 증명하지는 않지만, 프로젝트가 어떤 경계를 전제로 조립되는지는 보여준다.

### 1.3 AI가 작업하기 쉬운 형태의 문서와 인터페이스

다음 자료는 Feature → Requirement → Task → Acceptance Criteria → Input → Validation을 연결한다.

- `Assets/Docs/Demo_GDD.md`: 플레이 규칙과 플레이어가 보게 될 결과.
- `Assets/Docs/Demo_Technical_Design.md`: 상태 소유자, 데이터 경계, 기술 제약.
- `Assets/Docs/*_Feature_Spec.md`: `REQ-*`, `TASK-*`, `AC-*` 단위의 범위.
- `Assets/Docs/Component_Contracts.md`: 컴포넌트 책임과 초기화 계약.
- `Assets/Docs/Input_Spec.md`: 모드별 키와 우선순위.
- `Assets/Docs/Unity_Traceability_Matrix.md`: 요구·구현·검증 상태 연결.
- `Assets/Docs/Validation_Report.md`와 개별 Evidence 문서: 실패, superseded evidence, 미검증 범위.
- `Assets/Scripts/Debug/GuardRoomDebugHooks.cs:35-81`: 근무 시작, 정확한 CAM/type/variant 생성, 중첩 시간, 위험 주시, 인터컴 대화 등 재현용 진입점.

**확인 사실:** 문서와 디버그 인터페이스가 존재하고 실제 요구 ID·검증 ID를 공유한다.  
**추론:** 이런 경계는 AI에게 한 번에 전체 게임을 맡기기보다 작은 수정과 검증을 전달하기 좋다. 문서가 처음부터 AI 작업을 위해 설계되었는지, AI가 제안한 뒤 채택됐는지는 확인 필요다.

### 1.4 변경과 실패의 흔적

Git 커밋은 사용할 수 없지만 문서에는 2026-08-14~09-02의 날짜별 revision이 남아 있다.

- 이전 단일 이상현상·재관찰 escalation 규칙은 복수 고유 인스턴스와 3개 이상 중첩 타이머로 superseded됐다.
- 선택 하이라이트는 초기 캡처에서 보이지 않아 RenderGraph 자원 선언과 production R8 mask 진단으로 범위를 좁혔다. 최신 검증에서는 MaskOnly의 Monitor / Intercom / clear 분기와 Final outline의 Monitor / Intercom 분기가 PASS했다. 다만 Full AC-PROP-005는 잔여 시각 조건 때문에 Partially Covered / Pending이다.
- Pause Settings의 해상도 dropdown은 초기 inspection을 통과했으나 사용자가 첫·마지막 행의 반쪽 잘림을 발견했다. 템플릿 geometry를 수정했으며 사용자 재검증은 대기 중이다.
- 창밖 2.5D 도로 비교 실험은 2026-09-01 사용자 확인으로 삭제되고 기존 표현으로 복구됐다.
- Intercom runtime TTS 증거는 pre-baked WAV revision에 의해 superseded됐다.
- Windows 빌드에서는 `Shader.Find`만 사용한 shader가 Player data에서 빠져 serialized reference로 변경한 기록이 있다.

이 기록들은 완성 기능보다 “무엇을 실패로 판정했고 증거 수준을 어디에서 멈췄는가”를 보여주는 자료로 더 적합하다.

## 2. AI 활용 역량 관점의 증거

| 관점 | 저장소에서 확인되는 증거 | 현재 해석 한계 |
| --- | --- | --- |
| Decomposition | 기능마다 GDD/Technical Design/Feature Spec/Input/Validation ID가 분리됨 | 분해를 개발자가 먼저 했는지 AI 초안을 수정했는지 확인 불가 |
| Constraint Definition | Screen `0x/1x/0.25x`, Sound 최초 재생, 위험 주시 10초, 이상현상 3개·5분, 인터컴 입력 순서처럼 수치·불변조건이 적힘 | 과거 실제 프롬프트는 없음 |
| Context Engineering | `Component_Contracts`, 구조 registry, scene blueprint, traceability가 코드 경로와 owner를 지정 | 이 문서들의 작성 주체 비율은 확인 불가 |
| Verification | compile/Console/Play Mode/Input System/capture/build을 구분하고 evidence ID로 남김 | 일반 자동화 테스트 suite는 없음 |
| Failure Detection | 보이지 않는 outline, dropdown half-row clipping, Title F same-frame double action 기록 | 일부 실패가 사용자의 직접 발견인지 문서가 명시한 경우에만 확정 가능 |
| Iteration | shader type → RenderGraph dependency → draw/binding/uniform 순으로 수정; superseded evidence 보존 | Git diff가 없어 각 수정의 정확한 코드 변화량은 알 수 없음 |
| Architecture Control | Bootstrap 초기화 순서, owner 문서, 데이터 catalog와 runtime controller 분리 | 이 구조를 누가 최초 제안했는지 확인 불가 |
| Scope Control | revision마다 미검증 범위를 적고, 요청하지 않은 Play Mode 검증을 수행하지 않았다고 표시한 행 존재 | 실제 작업 지시 전문은 없음 |
| Rejection / Rollback | Road/window experiment가 `Reverted`, 관련 프로젝트 자산 삭제, 원래 표현 복구 | 반려 이유와 비교 기준은 개발자 확인 필요 |
| Tool Building | Editor authoring 13개, 재현용 debug hook, run log와 bug report 도구 | 개발자가 도구 제작을 먼저 요구했는지 AI가 제안했는지 확인 필요 |

## 3. 후보 사례 분석

### 후보 A. URP RenderGraph 선택 하이라이트: 컴파일 통과를 화면 성공으로 보지 않은 사례

**Goal**  
선택한 오브젝트의 외곽선을 URP에서 표시하고, raycast와 원본 renderer state는 바꾸지 않는다.

**Constraints**

- 최종 revision은 내부 tint가 없는 outline-only 결과다.
- 선택을 해제하거나 대상을 바꾸면 rendering layer mask를 정확히 복원한다.
- 근거리·원거리와 scale 변화에서도 화면 기준 두께, hard corner, 가림 관계를 확인해야 한다.
- compile, registry state, raycast pass만으로 Visual Validated를 선언하지 않는다.

**확인된 AI 위임 범위**  
현재 접근 가능한 작업 기록과 문서에는 Unity Agent/Codex가 shader graph HLSL 타입, RenderGraph texture dependency, pass draw/binding 코드를 수정하고 capture·ShaderUtil·Console 검사를 수행한 과정이 남아 있다. 특정 줄을 AI 단독 저작으로 구분하지는 않는다.

**Verification / Failure / Direction Change**

1. Shader Graph 출력 `Vector4`와 HLSL `float3` 불일치로 D3D compile failure가 발생했다.
2. `float4` 수정 뒤 shader message와 Console error는 0이었다.
3. selection registry, renderer marking, raycast 유지도 통과했다.
4. 같은 카메라·같은 `RightWindowModel @ 1.132 m` 조건의 1920×1080 캡처에서 outline이 보이지 않았다.
5. `AddBlitPass`의 간접 global texture 사용을 custom raster pass와 명시적 `UseTexture`로 바꿨으나 두 번째 캡처도 실패했다.
6. 이후 renderer/submesh 직접 draw, command-buffer global binding, 초기화 시점 invariant와 zero uniform 원인을 수정했다.
7. 마지막 변경은 compile·static inspection까지만 통과했다. 새 Game View 시각 검증은 없다.

**Evidence**

- `Assets/Docs/Validation_Report.md:175-198`
- `Assets/Docs/Interactable_Props_Feature_Spec.md:76-89`
- `Assets/Docs/Unity_Traceability_Matrix.md:96-103`
- `Assets/Scripts/Rendering/SelectionSilhouetteRendererFeature.cs:82-201`
- `Assets/Scripts/Rendering/SelectionHighlightRegistry.cs`
- `Assets/Resources/Shaders/SelectionSilhouetteComposite.hlsl`

**현재 상태:** `Compile Verified + Runtime/Visual Tested`(Monitor / Intercom / clear 분기). Full AC-PROP-005는 `Partially Covered / Pending`이다.

**What this demonstrates**  
컴파일과 상태 검사를 시각적 acceptance로 대체하지 않은 과정, 실패마다 가설 범위를 줄인 과정, 통과하지 못한 상태를 그대로 남긴 사례다. 최종 포트폴리오의 가장 강한 후보로 판단한다.

**개발자 확인 필요:** 각 방향 전환에서 개발자가 내린 지시와 AI가 제안한 가설을 구분할 수 있는 설명이 필요하다.

### 후보 B. Screen·Sound의 UI 수명과 콘텐츠 수명 분리

**Goal**  
CCTV나 Notebook을 닫거나 채널을 바꿔도 Screen 진행도와 시작된 Sound 재생 위치가 GameObject 활성 상태에 끌려가 재시작되지 않게 한다.

**Constraints**

- Screen은 첫 노출 전 `0x`, 해당 CAM 표시 중 `1x`, 첫 노출 후 다른 화면에서는 `0.25x`다.
- 다시 해당 CAM으로 돌아오면 누적 progress에서 이어진다.
- Sound는 Monitor 밖 또는 해당 CAM에서는 즉시 시작한다. 다른 CAM을 보고 있을 때 생성되면 대기한다.
- 시작 여부와 playhead는 UI/channel 전환과 별도 상태로 보존한다.
- 올바른 신고로 해당 인스턴스가 사라질 때만 재생 상태를 제거한다.

**Failure Detection**  
접근 가능한 Codex 작업 `화면·음향 재시작 현상 확인`은 사용자가 책·CCTV·채널 전환 뒤 Screen/Sound가 다시 시작하는 현상을 제기한 기록과 연결된다. 원문 프롬프트를 저장소 증거처럼 인용하지 않는다.

**Verification**

- Screen: 미노출 progress `0`, 표시 중 `1.0`, 이탈 후 `0.25` 비율이 기록됐다.
- Sound: 잘못된 CAM에서는 대기, 해당 CAM에서는 재생, pause/resume 뒤 playhead `10.29477` 유지가 기록됐다.

**현재 코드와 문서의 충돌**

- Spec은 한 번 시작한 Sound가 이후 채널·view 변경에서도 계속된다고 적는다 (`Anomaly_Content_Feature_Spec.md:76`).
- 같은 문서의 86행은 다른 Monitor 채널에서 Sound를 “present하지 않는다”고 적는다.
- 현재 `AnomalyScheduler.GetPresentableSound`는 Monitor에서 선택 CAM의 Sound만 반환한다 (`AnomalyScheduler.cs:157-165`).
- 반환값이 없으면 `SoundAnomalyController.RefreshPresentation`은 활성 인스턴스를 `PauseAnomaly`한다 (`SoundAnomalyController.cs:115-127`).

따라서 “재시작/rewind하지 않고 위치를 보존한다”는 것은 확인됐지만 “다른 Monitor 채널에서도 실제 소리가 끊김 없이 계속 들린다”는 표현은 현재 코드와 일치하지 않을 수 있다.

**Evidence**

- `Assets/Docs/Anomaly_Content_Feature_Spec.md:61-86, 98, 115-117`
- `Assets/Docs/Demo_GDD.md:58`
- `Assets/Scripts/Core/AnomalyScheduler.cs:94-104, 157-165`
- `Assets/Scripts/Audio/SoundAnomalyController.cs:115-244`
- `Assets/Scripts/Observation/CctvController.cs`

**현재 상태:** Screen `Runtime Tested`. Sound playhead retention `Runtime Tested`. Sound의 정확한 audible continuity 의미는 `확인 필요`다.

**What this demonstrates**  
UI 수명과 게임 상태 수명을 분리하는 요구를 수치로 정의하고, 재현 가능한 playhead로 회귀를 확인한 사례다. 다만 충돌을 먼저 정리한 뒤 최종 포트폴리오에 넣어야 한다.

### 후보 C. 복수 이상현상: 고유 인스턴스, 중복 방지, 두 종류의 시간 기반 실패

**Goal**  
여러 CAM의 이상현상이 동시에 남아 있는 게임 규칙을 만들고, 재관찰을 새 이상현상으로 세지 않으며, 중첩 방치와 위험한 화면 주시를 서로 다른 실패 조건으로 판정한다.

**Constraints**

- 인스턴스는 stable `instanceId`, channel, type, variant, danger, phase를 갖는다.
- 한 채널에는 동시에 하나의 active anomaly만 둔다.
- 재관찰은 관찰 상태만 바꾸고 active count를 늘리지 않는다.
- 3개 이상이 5 real minutes 동안 연속 유지될 때 실패한다. 3개 미만이 되면 즉시 0으로 reset한다.
- 위험 Stranger가 실제 선택 CAM에 표시된 동안만 10 continuous seconds를 잰다. CAM 변경·Monitor 이탈·clear 시 reset한다.
- 00:35까지 spawn을 막고 00:36부터 가능하게 한다.

**Iteration**  
Technical Design과 Feature Spec은 이전의 single-active/re-observation escalation model을 superseded했다고 명시한다. 현재 구조는 `List<ActiveAnomaly>`와 고유 ID, 별도 overlap timer를 사용한다.

**Verification**

- 두 인스턴스 재방문 시 count 유지.
- 3개 이상 pre-limit/limit 및 count 하락 reset을 deterministic inspection으로 확인.
- 00:36 gate 확인.
- 모든 실패 경로에서 미신고 항목 snapshot 8/8 runtime pass.
- 위험 주시 수치·reset은 deterministic inspection까지만 통과했고 사용자 Play Mode validation은 대기 중이다.

**Evidence**

- `Assets/Scripts/Core/AnomalyScheduler.cs:16-35, 43-53, 80-108, 139-229`
- `Assets/Scripts/Observation/CctvController.cs`
- `Assets/Scripts/Debug/GuardRoomDebugHooks.cs:47-64`
- `Assets/Docs/Anomaly_Content_Feature_Spec.md:61-117`
- `Assets/Docs/Demo_Technical_Design.md:41`
- `Assets/Docs/Validation_Report.md:341-349`

**현재 상태:** core concurrency와 overlap은 `Runtime Tested` 또는 deterministic Unity inspection. 위험 주시의 사용자 체감 검증은 `Pending`이다.

**What this demonstrates**  
큰 “이상현상 시스템”을 identity, selection, observation, report, 두 개의 timer로 나눈 흔적이 있다. 수치 경계값을 Debug Hook으로 직접 구성한 점도 사례 가치가 높다.

**개발자 확인 필요:** superseded된 이전 규칙을 왜 바꿨는지, 그 판단이 플레이 경험·난이도·구현 오류 중 무엇 때문이었는지 확인해야 한다.

### 후보 D. Intercom: 입력 순서와 콘텐츠를 상태·데이터로 분리

**Goal**  
Respond/Replay/Verify/Answer/Open/End 입력 순서가 통화 종류에 따라 달라지고, 방문자 이상현상·신고·실패와 연결되는 인터컴을 구성한다.

**Constraints**

- runtime state는 `Idle`, `Ringing`, `Connected`, `AwaitingReport`, `FailureAlert`다.
- Ringing timeout은 15 real seconds다.
- 잘못된 일반 기능 입력은 warning/Mistake를 증가시키고, wrong End는 즉시 실패한다.
- 정상·비정상·방문자 통화마다 허용 순서가 다르다.
- 통화 콘텐츠는 JSON catalog, 상태 전이는 controller, UI 장치 동작은 environment component가 맡는다.
- 현재 revision은 runtime SAPI 호출이 아니라 locale별 pre-baked WAV를 사용한다.

**Verification / Revision boundary**

- 2026-08-30 core flow는 사용자 확인으로 기록됐다. `normal_noise`, Stranger 04, Danger 01 등의 입력 순서와 Idle 복귀가 포함된다.
- 이 검증의 Caller TTS 항목은 2026-09-01 pre-baked WAV revision에 의해 명시적으로 superseded됐다.
- 이후 영어 Zira bake는 offline generation과 Unity import까지만 확인됐다. 실제 locale routing과 청취 승인은 남아 있다.

**수량 충돌**

- 현재 파일은 WAV 90개, 한국어 45개, 영어 45개다.
- `Intercom_Feature_Spec.md:38`도 90개/언어별 45개를 적는다.
- `Validation_Report.md:396-400`은 2026-09-02에 영어 48개 생성·import라고 적는다.
- 따라서 48개 기록은 현재 revision과 불일치하거나, 이후 세 파일이 제거된 것으로 보인다. Git이 없어 변화 순서를 확인할 수 없다.

**Evidence**

- `Assets/Scripts/Core/IntercomConversationData.cs:14-20`
- `Assets/Scripts/Core/IntercomController.cs`
- `Assets/Resources/Intercom/intercom_conversations.json`
- `Assets/Resources/Intercom/Voice`
- `Assets/Docs/Intercom_Feature_Spec.md`
- `Assets/Docs/Intercom_Validation_Evidence.md:1-44`
- `Assets/Docs/Validation_Report.md:393-403`

**현재 상태:** core FSM은 `User Validated` 기록. 현재 pre-baked WAV revision의 runtime·청취 검증은 `Pending / Not Verified`다.

**What this demonstrates**  
상태 로직과 대화 데이터를 분리하고, 새 audio architecture가 들어오자 과거 검증을 그대로 재사용하지 않은 사례다. 수량 충돌을 해소해야 최종 사례로 사용할 수 있다.

### 후보 E. Pause: 기존 모드와 외부 상태를 정확히 돌려놓는 소유권

**Goal**  
Room/Monitor/Notebook/Intercom 어디서든 Pause를 열되, resume 시 기존 게임 모드와 시간·오디오 위치를 잃지 않는다.

**Constraints**

- Pause 전 `Time.timeScale`과 `AudioListener.pause`를 캡처해 고정값이 아닌 원래 값으로 복원한다.
- 기기 닫기 키 `F`와 전역 pause `Escape`의 역할을 분리한다.
- Pause Settings 안에서 dropdown → Settings → pause root → gameplay 순으로 Escape 우선순위를 둔다.
- scene transition에서는 scale, cursor, dropdown 잔여 상태를 정리한다.
- Fan과 Sound playhead는 resume 뒤 이어져야 한다.

**Verification**

- 실제 production `PauseMenuController.Update`에 queued Input System Escape를 전달했다.
- 네 모드에서 scale 0을 확인했다.
- Room/Monitor/Notebook은 1, Intercom 시험값은 0.5로 정확히 복원됐다.
- dropdown, Settings, pause root의 세 단계 Escape가 통과했다.
- 검증 뒤 PlayerPrefs와 scene dirty state까지 원래 상태로 되돌렸다는 기록이 있다.

**Evidence**

- `Assets/Scripts/UI/PauseMenuController.cs:50-119, 136-170`
- `Assets/Docs/Pause_Menu_Dropdown_UX_Feature_Spec.md`
- `Assets/Docs/Input_Spec.md:18`
- `Assets/Docs/Validation_Report.md:351-372`
- `Assets/Docs/Unity_Traceability_Matrix.md:115-125`

**현재 상태:** Pause lifecycle은 `Runtime Tested`. 물리 키 감각, 모든 해상도, Windows standalone resolution 적용은 일부 `Pending`이다.

**What this demonstrates**  
AI에게 UI 토글을 맡기는 데 그치지 않고, 시스템이 빌려 쓰는 global state의 캡처·복원과 입력 우선순위를 acceptance로 만든 사례다.

**개발자 확인 필요:** 0.5 복원 같은 불변조건을 개발자가 사전에 요구했는지, 초기 구현 실패 뒤 추가했는지 확인하면 사례가 더 선명해진다.

### 후보 F. 2.5D Road/window 실험의 rollback

**확인 사실**

- `RoadWindowComparison`은 2026-08-31의 historical experiment로 기록됐다.
- 2026-09-01 사용자 확인으로 scene hierarchy와 프로젝트용 파생 prefab/material/combined mesh/authoring/controller가 삭제됐다.
- 원래 `Window/ComplexGateView` 표현이 복구됐다.
- 원본 Road FBX는 삭제하지 않았다.

**Evidence**

- `Assets/Docs/SampleScene_Road_Window_Blueprint.md:1-16`
- `Assets/Docs/Project_Structure_Registry.md:84-91`
- 현재 접근 가능한 Codex 작업 기록의 도로·창문 관련 작업 맥락

**현재 해석:** AI 결과를 반려하고 범위를 줄인 증거 후보는 된다. 그러나 저장소에는 비교 이미지, rollback 전 코드, Git diff, 반려 기준이 충분히 남아 있지 않다.

**개발자 확인 필요:** 무엇이 기준 미달이었는지—아트 방향, 창밖 구도, 성능, 작업 범위, 일정—를 확인해야 한다. 확인 전에는 최종 대표 사례보다 보조 사례가 적절하다.

### 후보 G. 검증 도구 자체: Debug Hook, Editor Authoring, Diagnostics

**확인 사실**

- `GuardRoomDebugHooks`는 exact CAM/type/variant spawn, active ID 조회, overlap time 설정, 위험 주시 time 설정, 특정 intercom conversation 시작, finale stage 이동을 제공한다.
- `Assets/Scripts/Editor`에는 13개의 scene/prefab authoring·동기화·Windows build 도구가 있다.
- `RunLogService`와 bug-report 관련 컴포넌트는 runtime context 수집 경계를 만든다.
- bug-report endpoint는 비어 있으며, 서버 2xx/failure/retry와 Play Mode lifecycle은 미검증이다.

**Evidence**

- `Assets/Scripts/Debug/GuardRoomDebugHooks.cs:35-81, 115-269`
- `Assets/Scripts/Editor/*.cs`
- `Assets/Scripts/Diagnostics/*.cs`
- `Assets/Docs/Bug_Report_Feature_Spec.md`
- `Assets/Docs/Validation_Report.md:3-8`

**현재 해석:** 반복 검증을 위한 도구를 별도 사례로 만들 수 있다. 다만 “개발자가 AI 검증을 위해 먼저 요구했다”는 설명은 저장소에 없다. 대표 사례의 Verification 근거로 사용하는 편이 안전하다.

## 4. 확실한 사실

1. 프로젝트는 게임 규칙을 prose만으로 두지 않고 `REQ`, `TASK`, `AC`, `INPUT`, `VAL` ID로 나눈다.
2. compile, runtime, visual, user validation을 서로 다른 상태로 기록한다.
3. 실패·미검증·superseded evidence를 삭제하지 않고 현재 문서에 남겼다.
4. 정확한 이상현상과 경계 시간을 만들 수 있는 runtime Debug Hook이 있다.
5. 선택 하이라이트는 compile과 runtime state 이후에도 실제 화면을 별도로 검증했고, 최신 tested branches는 PASS다. 전체 수용 기준은 아직 완료가 아니다.
6. dropdown의 실제 화면 문제를 사용자가 발견했다는 기록이 있다.
7. Road/window 실험은 사용자 확인 뒤 되돌렸다.
8. Intercom의 과거 runtime TTS 검증은 현재 pre-baked WAV 구현을 증명하지 않는다고 문서가 경고한다.
9. Windows build 성공 기록과 실행 파일은 있지만, 모든 기능의 standalone gameplay·화면 검증을 뜻하지 않는다.
10. 별도 unit/integration test assembly와 성능 측정 코드는 확인되지 않았다.
11. 유효한 Git history와 저장소 내 원문 AI prompt는 확인되지 않았다.

## 5. 추론에 불과한 내용

다음 문장은 개발자 확인 없이 최종 포트폴리오에 확정적으로 쓰면 안 된다.

- 개발자가 모든 architecture를 먼저 설계하고 AI는 코드만 썼다.
- `Component_Contracts`와 traceability 체계는 개발자가 AI context engineering 목적으로 직접 만들었다.
- AI가 작성한 코드의 비율은 몇 퍼센트다.
- superseded된 규칙은 AI의 잘못 때문에 폐기됐다.
- Road/window 실험은 AI가 제안했고 개발자가 미적 품질 때문에 반려했다.
- 선택 highlight의 각 진단 가설은 개발자가 제시했다거나 반대로 AI가 독자적으로 제시했다.
- 반복 수정된 파일의 횟수와 commit 순서가 현재 문서 날짜와 같다.
- 빌드 성공은 전체 플레이, 전체 입력, 모든 시각 결과의 성공이다.
- 코드 구조가 현재 형태라는 이유만으로 유지보수성·성능이 향상됐다.

## 6. 개발자에게 확인해야 할 질문

최종 포트폴리오 전에는 아래 답변이 필요하다. 실제 과거 prompt 전문은 없어도 된다. 당시 판단을 짧게 설명하면 충분하다.

1. 대표 사례마다 개발자가 먼저 고정한 목표·금지 조건은 무엇이었나? AI가 처음 제안한 것과 개발자가 수정한 것을 구분할 수 있는가?
2. Screen/Sound 재시작 문제는 어떤 실제 조작 순서로 발견했나? 시작된 Sound는 다른 Monitor CAM에서도 계속 **들려야** 하나, 아니면 pause하되 playhead만 이어져야 하나?
3. 단일 이상현상·재관찰 escalation을 복수 인스턴스·중첩 타이머로 바꾼 이유는 무엇인가?
4. RenderGraph highlight의 tested branches 이후 남은 occlusion/depth, distance/scale ±1 px, hard-edge/submesh continuity, window/empty traversal은 어떤 순서로 검증할 것인가?
5. Intercom 현재 정답 수량은 언어별 WAV 45개인가? 9월 2일 검증의 영어 48개 중 세 파일이 제거된 이유가 있는가?
6. 현재 pre-baked Intercom WAV를 한국어·영어로 실제 플레이하고 청취했나?
7. Pause의 exact `TimeScale=0.5` 복원과 playhead 보존은 최초 요구였나, 테스트 중 발견해 추가한 조건인가?
8. Road/window 실험을 되돌린 판단 기준은 무엇이었나? AI가 만든 부분과 개발자가 비교·판정한 부분은 무엇인가?
9. Debug Hook, traceability, Editor authoring 도구는 개발자가 명시적으로 요구했나, AI 제안을 채택했나, 또는 공동 반복으로 생겼나?
10. 프로젝트의 실제 Git 저장소나 백업 commit history가 다른 위치·원격에 존재하는가?
11. 성능 예산이나 target hardware 기준을 별도로 측정한 자료가 있는가?
12. Nano Banana 이미지와 Pixabay 음원 각각의 파일별 출처·라이선스 기록을 제출 전 정리할 수 있는가?

## 7. 최종 포트폴리오에 넣지 않는 것이 좋은 사례

| 사례 | 이유 |
| --- | --- |
| C# 파일 수·코드 줄 수 | AI가 만든 코드량을 성과로 오해하게 하며 사람의 판단을 설명하지 못한다. 프로젝트 범위 표시에만 사용한다. |
| 일반적인 기능 목록 | CCTV·자막·설정이 존재한다는 사실만으로 AI 위임·검증 능력이 드러나지 않는다. |
| Bug report 전송 시스템 | 구조는 있으나 endpoint가 비어 있고 Play Mode·server response가 검증되지 않았다. Tool Building의 보조 근거가 적절하다. |
| Trailer·시네마틱 일반 소개 | 프로그래밍 포트폴리오의 중심 메시지와 거리가 있고 일부 production asset·시각 QA가 남아 있다. |
| 분위기·Nano Banana 이미지 생성 | 권리·출처와 주관적 품질 판단 설명이 선행돼야 한다. AI 코딩 에이전트 활용 사례의 중심으로는 약하다. |
| 로컬라이징·접근성 전체 | 구현 범위는 크지만 현재 증거만으로 개발자 판단과 AI 위임의 경계를 선명하게 나누기 어렵다. Intercom/subtitle revision의 보조 근거로 쓴다. |
| Road/window rollback 단독 사례 | rejection 흔적은 좋지만 rollback 전 diff와 반려 사유가 없다. 개발자 설명을 보충하면 승격할 수 있다. |
| “Windows build 성공” 단독 사례 | build gate는 검증 방법이지 그 자체로 AI 활용 판단 사례는 아니다. Shader inclusion failure와 묶을 때만 의미가 있다. |
| Intercom 음원 수치 | 현재 90개와 과거 영문 48개 기록이 충돌한다. 정리 전에는 정량 성과로 쓰지 않는다. |

## 8. 가장 강한 사례 추천

### 1순위 — URP RenderGraph 선택 하이라이트

compile pass → bounded visual fail → MaskOnly로 production mask 분리 진단 → raw white/black 확인 → Final outline 확인의 순서가 문서와 capture에 보존돼 있다. tested branch의 PASS와 전체 AC의 Pending을 분리하는 기준을 보여준다.

### 2순위 — Screen·Sound 상태 연속성

사용자가 실제 화면 전환에서 재시작 문제를 발견한 기록, 수치화된 Screen timeline, Sound playhead 검증이 있다. 현재 Sound semantics 충돌을 먼저 해소해야 한다.

### 3순위 — 복수 이상현상과 두 시간 기반 실패 규칙

고유 identity, 중복 방지, overlap reset, dangerous gaze reset을 작은 규칙으로 분리했고 Debug Hook으로 경계값을 재현했다. 개발자가 기존 규칙을 바꾼 이유를 보충하면 Human Decision이 선명해진다.

### 4순위 — Pause 상태 소유권과 정확한 복원

단순 UI 표시가 아니라 global state 대여·복원, 입력 우선순위, playhead 보존을 검증했다. 0.5 시험값은 “1로 고정 복원” 같은 그럴듯한 오류를 잡는 설명에 적합하다.

### 5순위 — Intercom FSM과 validation revision boundary

상태·데이터 분리와 입력 순서가 구체적이며 core flow는 사용자 확인 기록이 있다. runtime TTS에서 pre-baked WAV로 바뀐 뒤 과거 evidence를 폐기한 점이 좋다. 현재 WAV 수량과 최신 runtime 검증을 정리한 뒤 사용한다.

Road/window rollback은 개발자가 반려 기준과 당시 AI 역할을 보충하면 Intercom 대신 넣을 수 있는 대체 후보다.

## 9. 다음 단계

이 문서의 질문에 개발자가 답한 뒤 최종 포트폴리오를 작성한다. 최종 문서는 기능 나열이 아니라 각 사례에서 다음 흐름만 남기는 것이 적절하다.

`게임 목표와 제약을 개발자가 고정 → 구현·탐색을 AI에 위임 → 상태·입력·화면으로 검사 → 실패 기준을 선언 → 범위를 다시 지정 → 검증된 수준까지만 채택`

확인 답변이 없는 항목은 `확인 불가`, `개발자 확인 필요`, `Pending / Not Verified`로 유지한다.
