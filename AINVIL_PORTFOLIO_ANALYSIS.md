# AInvil Portfolio Analysis

> 조사 기준일: 2026-09-05 (Asia/Seoul)  
> 조사 범위: 현재 `GameDesigner` 작업 트리, `plugins/ainvil`의 코드·스키마·상태·리포트·증거, 그리고 `state/workspace_manifest.json`이 명시적으로 연결한 `E:/wiseongjun/Unity/DungeonRecoveryCompany`의 관련 파일 존재 여부  
> 검증 수준: **Static Analysis**. 저장소 검증기와 MCP stdio handshake는 실행했지만, 조사 시점의 Unity HTTP Bridge(`127.0.0.1:17777`)는 연결 거부 상태였으므로 새 Play Mode 검증은 수행하지 않았다.

## 1. Executive Finding

> **AInvil은 게임 설계 의도에서 Unity 구현과 검증 증거까지의 추적 가능성을 유지하기 위해 개발된 Codex 플러그인·로컬 워크플로 런타임·Unity Editor 브리지의 결합체이다.**

AInvil은 하나의 Unity 플러그인만이 아니다. 저장소에는 Codex 플러그인 manifest와 네 개의 agent skill, Node.js CLI 및 상태/리포트 생성 모듈, stdio MCP 서버, Unity Package Manager 패키지, JSON Schema 기반 상태·증거 파일, 라이브 하네스가 함께 있다. 실제 Unity 조작은 MCP 서버가 localhost HTTP RPC로 Unity Editor 확장에 요청을 전달하는 방식이다. 기획과 기술 기획은 주로 agent skill의 절차와 Markdown 템플릿으로 지원되며, GDD를 파싱해 기술 요구사항이나 코드를 자동 생성하는 결정적 런타임은 확인되지 않는다. 반면 Production State Graph는 Feature, Requirement, ImplementationTask, UnityTarget, AcceptanceCriterion, ValidationEvidence를 ID와 edge로 연결하며, CLI는 이 그래프에서 대시보드·추적성·리스크·다음 작업을 계산한다. Live Harness는 compile gate 뒤 Play Mode에 진입하고 프로젝트별 공개 validation hook을 호출해 결과를 JSON evidence로 남길 수 있다. 따라서 단순한 “AI가 Unity 코드를 작성하는 도구”와의 차이는 코드 생성 자체보다 요구사항, Unity 대상, 검증 조건, 실행 증거를 별도 상태로 유지하고 연결하려는 구조에 있다. 다만 현재 그래프에는 28개의 연결 누락이 있으며, 생성된 traceability 40행 중 `Complete`는 1행뿐이다. 최신 DRC 증거 파일이 `Passed`여도 그래프의 내장 evidence가 `Not tested`인 사례가 있어 동기화가 완전하다고 볼 수 없다. 자체 AI provider 구현도 비어 있으므로 실제 추론과 코드 작성은 호스트 agent(Codex/Claude 등)가 담당한다.

> **개발자가 정의한 전체 방법론 중 현재 AInvil이 자동화하는 범위:** 구조화된 상태·검증 스키마 검사, Unity RPC 조작, compile/console preflight, 일부 프로젝트별 Play Mode 검증, evidence·dashboard·traceability·workflow report 생성이다.

> **AInvil이 보조하지만 개발자의 판단이 필요한 범위:** GDD와 Technical Design 작성·확정, requirement/acceptance/task 분해, AI가 제안한 코드와 장면 변경의 채택, 시각·플레이 감각·범위 변경 판단, 최종 출시 승인이다.

> **현재 AInvil이 지원하지 않거나 증거가 부족한 범위:** GDD→Technical Design→coding task의 완전 자동 변환, 일반화된 코드 생성 런타임, 모든 변경의 자동 revision/stale 처리, 범용 Game/Scene View 캡처 RPC, audio/profiler 검증이다. Action Required의 AInvil plugin/runtime 및 Unity MCP 사용은 개발자가 직접 확인했다.

### 사실 분류

- **[확인 사실]** 현재 코드·schema·JSON·실행한 저장소 검증에서 직접 확인했다.
- **[기록상 사실]** 저장된 과거 evidence/report가 말하지만 이번 조사에서 Unity 동작을 재실행하지 않았다.
- **[추론]** 구조가 지원하는 합리적 사용 방식이며 개발자 의도라고 확정하지 않는다.
- **[개발자 확인 필요]** 저장소만으로 최초 의도나 선택 이유를 확정할 수 없다.

## 2. Repository Architecture

### 2.1 프로젝트 형태

**[확인 사실]** `plugins/ainvil/.codex-plugin/plugin.json`은 AInvil을 Codex plugin `0.6.0+codex.20260706113846`으로 선언하고 `skills/`와 `.mcp.json`을 진입점으로 지정한다. Unity 측은 `com.codex.unity-bridge` UPM package `0.6.0`이며 최소 Unity 버전은 `2021.3`이다. 저장소 자체는 완성 게임 Unity 프로젝트가 아니라 plugin source와 설치용 package를 보유한다. `workspace_manifest.json`은 실제 검증 대상 Unity 프로젝트를 외부 경로 `E:/wiseongjun/Unity/DungeonRecoveryCompany`로 지정한다.

```text
AInvil repository
├── Codex Plugin
│   ├── .codex-plugin/plugin.json
│   └── skills/{orchestrator,gdd-agent,unity-agent,input-agent}/SKILL.md
├── Production Workflow Core (Node.js ESM)
│   ├── state/report/evidence loaders
│   ├── production intelligence, dashboard, traceability, sync
│   ├── workflow planning, approval, guarded execution
│   └── compile gate, release/productization checks
├── CLI
│   └── status, graph, evidence, workflow, gate, regression, doctor 등
├── MCP Adapter
│   └── stdio MCP ↔ localhost HTTP RPC
├── Unity Package
│   ├── Editor/CodexUnityBridgeServer.cs
│   └── Runtime/input bridge + generated UI runtime components
├── Validation Harness
│   ├── scenario + Validation Design
│   ├── live runner
│   └── ValidationEvidence
├── Structured Project Memory
│   ├── Production State Graph
│   ├── reviews/workflow runs/reports
│   └── JSON Schemas
├── Authoring Assets
│   ├── GDD/Technical Design/Feature/Input/contract templates
│   └── Dynamic UI Creator (static HTML/CSS/JS)
└── Benchmarks and Release Gates
```

### 2.2 주요 subsystem과 실제 책임

| subsystem | 실제 구현 | 근거 | 판정 |
| --- | --- | --- | --- |
| Agent roles | Director/Orchestrator/GDD/Unity/Input 역할, source-of-truth 순서, handoff 규칙을 skill 문서로 정의 | `plugins/ainvil/skills/*/SKILL.md` | 절차 구현; 독립 실행 엔진은 아님 |
| Production State | typed node/edge graph, status, owner, validation level | `state/production_state_graph.json`, `schemas/production_state_graph.schema.json` | 구현됨 |
| Production Intelligence | 그래프의 health, coverage, risk, recommendation 계산 | `scripts/generate-production-intelligence-report.mjs` | 구현됨; read-only 판단층 |
| Traceability | graph와 외부 evidence를 읽어 feature→requirement→task→target→AC→evidence 행 생성 | `core/traceability-view.mjs` | 구현됨; 현재 연결 누락 다수 |
| Workflow governance | transition plan, approval class, evidence/review/user-approval gate | `core/workflow-transitions.mjs`, `core/workflow-approvals.mjs` | 구현됨 |
| Workflow execution | 안전한 동기화/리포트 생성; 첫 executor의 실제 transition은 `RunBenchmark`만 지원 | `core/workflow-runtime.mjs`, `core/workflow-executor.mjs` | 제한적으로 구현됨 |
| Unity MCP | 52개 MCP tool schema와 Unity RPC forwarding | `mcp-server/server.mjs` | 구현됨; stdio handshake 확인 |
| Unity Editor bridge | localhost `HttpListener`, main-thread dispatch, scene/object/component/asset/play/test API | `unity-package/.../Editor/CodexUnityBridgeServer.cs` | 구현됨; 이번 조사에서 live 접속 불가 |
| Runtime input hooks | key/click/setup hook event, trace와 debug state | `Runtime/AInvilRuntimeInputTestBridge.cs` | 구현됨 |
| Live validation | compile gate, scenario preparation, Play Mode, hook invocation, assertions, evidence write | `scripts/run-ainvil-live-harness.mjs` | 구현됨; project-specific path 포함 |
| Dynamic UI | 브라우저 편집기, UI Layout schema/validator, Unity apply/export | `ui-creator/`, `schemas/ui_layout.schema.json`, bridge의 apply/export RPC | 현재 작업 트리에 구현됨; 일부 파일은 아직 untracked |
| AI provider | 추상 `ProviderAdapter`, tool format 변환 | `core/provider-adapter.mjs`, `core/tool-calling-adapter.mjs` | interface만 존재; 실제 provider 없음 |

### 2.3 Runtime/Editor assembly와 namespace

- Editor assembly: `Codex.UnityBridge.Editor`; `includePlatforms: ["Editor"]`; `Codex.UnityBridge.Editor` namespace.
- Runtime assembly: `Codex.UnityBridge.Runtime`; 모든 플랫폼; `Codex.UnityBridge` namespace.
- Runtime components: `AInvilRuntimeInputTestBridge`, 호환용 `AInvilInputTestBridge`, `AInvilGeneratedUiController`, `AInvilUiInteractionRelay`, `AInvilSafeAreaFitter`.
- `PlayerController`는 `Codex.UnityBridge.Sample` namespace의 sample이다. 실제 최신 example harness가 이 component를 외부 Unity 프로젝트에서 찾지 못해 실패한 기록이 있다.
- `ScriptableObject` subclass를 AInvil 데이터 모델로 저장하지는 않는다. `unity_create_asset` RPC가 사용자 프로젝트의 임의 ScriptableObject type을 asset으로 생성하는 기능은 있다.

### 2.4 통신 경로

```text
Host AI Agent
  → MCP JSON-RPC over stdio (`mcp-server/server.mjs`)
  → HTTP POST http://127.0.0.1:17777/rpc
  → `CodexUnityBridgeServer.HandleContext`
  → main-thread queue
  → `Dispatch(method, params)`
  → UnityEditor / UnityEngine API
  → JSON result
  → MCP text content
```

`CodexUnityBridgeServer`는 localhost에만 bind하며 별도 인증 코드는 없다. Play Mode/assembly reload 때 listener를 중지하고 preference를 이용해 재연결한다. MCP adapter는 일반 호출을 최대 6회 재시도하지만 `unity_enter_play_mode`는 한 번만 요청한다. 이 구조는 로컬 신뢰 경계를 전제로 한다.

## 3. Development Methodology

개발자가 정의한 `AInvil Development Pipeline`은 다음과 같다.

```text
Game Design
  → Technical Design
  → Implementation + structured project memory
  → live validation against running Unity
  → correction and revalidation
```

저장소의 운영 원칙은 이를 더 작은 단위로 표현한다.

```text
Feature → Requirement → Task → Acceptance Criteria
  → Implementation → Validation Evidence
```

**[확인 사실]** 두 번째 체인은 agent skill, graph schema, traceability generator, validation schema에 반복된다. **[추론]** 이 분리는 AI의 자유형 대화를 프로젝트 상태와 검증 가능한 단위로 바꾸려는 설계로 해석할 수 있다. 그러나 “왜 이 순서를 선택했는지”를 설명하는 최초 의사결정 기록은 확인되지 않았으므로 철학적 동기는 개발자 확인이 필요하다.

핵심 설계 선택은 코드에서 다음과 같이 관찰된다.

- 검증 전 완료 승격을 막는다. `workflow-approvals.mjs`는 `ResolveValidationGap`을 `EvidenceRequired`로 분류한다.
- low-risk 자동화와 의미 변경을 분리한다. 현재 자동 실행 가능한 transition은 benchmark refresh이며, blocker 해소나 열린 질문은 user/review/evidence를 요구한다.
- compile 실패 시 Play Mode를 시도하지 않는다. compile-blocked evidence에는 `playModeAttempted: false`가 기록된다.
- graph를 운영 backbone으로 사용하지만 Markdown 설계 문서를 상위 source-of-truth로 남긴다.
- 예제(`Example`)와 제품 증거(`Operational`)를 분류해 sample 성공을 제품 검증으로 오인하지 않도록 한다.
- 시각 검증이 통과해도 `humanReviewRequired: true`, `publicReleaseReady: false`를 유지한다.

## 4. Methodology ↔ Implementation

### Stage A — Game Design

| 구분 | 조사 결과 |
| --- | --- |
| Methodology | GDD를 먼저 작성하고 사용자 창작 의도를 최상위 권한으로 유지한다. |
| Implemented | `gdd-agent` skill, `templates/gdd.md`, completeness/design review 템플릿, benchmark case가 있다. graph는 Vision/Feature/DesignDecision node를 표현할 수 있다. |
| Manual/Agent-mediated | GDD 내용 생성·수정은 호스트 AI agent와 사용자의 대화/파일 편집으로 수행된다. core code가 GDD schema를 parse해 graph를 자동 갱신하는 경로는 없다. |
| 이후 참조 | `context-pack.mjs`가 `gddSummary`를 담을 수 있으나 이 함수를 호출하는 production code는 확인되지 않는다. 현재 graph node 104개 중 실제 document `refs`가 있는 node는 5개뿐이다. |
| 변경 추적 | Git 이외의 GDD-specific revision history는 없다. graph의 `version` 및 `supersedes` 표현은 가능하지만 현재 node별 version, supersedes edge, Stale/Superseded node는 0개다. |

### Stage B — Technical Design

| 구분 | 조사 결과 |
| --- | --- |
| Methodology | GDD를 system boundary, component/data/input contract, requirement와 BDD acceptance로 변환한다. |
| Implemented | `technical_design.md`, `feature_spec.md`, `component_contract.md`, `prefab_contract.md`, `scene_blueprint.md`, `input_spec.md` 템플릿과 graph node types가 있다. Dynamic UI RFC에는 REQ/TASK/AC가 명시되어 있다. |
| Manual/Agent-mediated | 변환 규칙은 GDD Agent skill 지침이다. 실제 GDD를 입력받아 Technical Design JSON/Markdown을 생성하는 core 함수나 concrete provider call은 없다. |
| Traceability | graph edge로 연결할 수 있고 generator가 누락을 표시한다. 현재 DRC requirement는 FeatureSpec 연결이 없어 `Needs Feature Spec`으로 보고된다. |

### Stage C — Implementation

실제 일반 경로는 완전 자동 pipeline이 아니라 다음 두 층의 조합이다.

```text
Requirement/Task/contract in documents or graph
  → host AI Agent selects/reads relevant files
  → agent writes C#/assets or calls Unity MCP
  → Unity Bridge mutates scene/assets
  → compile/console inspection
  → graph/report sync (separate step)
```

**[확인 사실]** Unity Bridge는 GameObject 생성·수정·삭제, component 추가/삭제/field 설정/reference 연결, prefab instantiate/apply/revert, scene open/save, asset/material/animator/UI 생성, batch Undo group을 지원한다. 그러나 AInvil core가 requirement에서 관련 repository 파일을 자동 검색·선택하거나 AI에게 coding prompt를 보내는 구현은 없다. `ProviderAdapter.sendMessage()`와 `streamMessage()`는 기본적으로 예외를 던지며 concrete adapter가 등록되어 있지 않다.

Live Harness의 DRC 경로도 C# source를 생성하지 않는다. 이미 외부 Unity 프로젝트에 존재하는 `AInvilProceduralRecoveryJobBuilder` component를 생성/찾고 `BuildProceduralRecoveryJobScene` 공개 method를 호출한다. 따라서 해당 사례에서 **scene 재구성과 검증은 자동화**되지만 **그 builder/controller source가 최초로 어떻게 작성됐는지는 저장소가 증명하지 않는다**.

### Stage D — Structured memory / “Database 구축”

JSON graph, evidence, review, workflow run, report를 파일로 축적한다. 이는 5절에서 상세히 구분한다.

### Stage E — Runtime validation and iteration

compile gate → scene/build preparation → Play Mode → input/debug hook → observation/assertion → evidence JSON까지 구현되어 있다. 실패는 `Failed`, 환경 문제는 `Blocked`, compile 문제는 `Compile Failed/CompileBlocked`로 분류되며 next action을 남긴다. 다만 실패가 자동으로 새 coding task를 만들고 AI가 수정한 뒤 재검증하는 범용 closed loop는 없다. workflow planner가 후보 next action을 계산하고, host agent 또는 사용자가 다음 구현을 수행해야 한다.

## 5. Data Model

### 5.1 실제 저장 기술

**[확인 사실]** SQLite, SQL migration, ORM, DB connection, `.db` 파일은 없다. AInvil이 말하는 database에 가장 가까운 구현은 versioned JSON documents와 JSON Schema, 그리고 이를 읽어 파생 report를 만드는 Node.js module이다.

- canonical operational graph: `state/production_state_graph.json`
- validation records: `validation/evidence/*.json`
- review records: `reviews/*.json`
- workflow execution history: `workflow/runs/*.json`
- derived views: `reports/project_dashboard.json`, `traceability_view.json`, `sync_report.json`, intelligence/release/productization reports
- schemas: `schemas/*.schema.json`

현재 graph는 104 nodes, 122 edges다. node type은 Vision 1, Milestone 2, Feature 4, Requirement 24, FeatureSpec 1, ImplementationTask 23, UnityTarget 5, InputSpec 2, AcceptanceCriterion 33, ValidationEvidence 5, Risk 1, NextAction 3이다.

### 5.2 실제 ERD에 해당하는 graph model

```text
Vision
  └─(derives_from)─ Milestone
       └─(derives_from)─ Feature
            ├─(linked)─ FeatureSpec
            └─(derives_from)─ Requirement
                 ├─(implements)← ImplementationTask
                 │                  └─(maps_to)← UnityTarget
                 └─(derives_from)← AcceptanceCriterion
                                      └─(validates)← ValidationEvidence

InputSpec ─(maps_to)─ AcceptanceCriterion / UnityTarget
Risk ─(affects)─ production node
NextAction ─(next_step_for)─ target node
ImplementationTask ─(depends_on)─ another task
```

방향은 현재 generator가 양방향 인접 탐색을 쓰므로 의미적 방향보다 node 연결 존재 여부가 더 중요하다.

### 5.3 키와 관계

- node의 논리 primary key: `node.id`; validator가 중복을 검사한다.
- edge의 논리 primary key: `edge.id`; `from`, `to`가 node ID를 참조한다.
- evidence의 논리 key: `evidenceId`; `acceptanceIds`, `requirementIds`, `unityTargets`가 관계 역할을 한다.
- scenario의 key: `id`; requirement/acceptance ID와 output evidence path를 보유한다.
- workflow execution의 key: `executionId`; transition/approval/source report와 outputs/evidence refs를 보유한다.
- 물리 foreign key constraint나 transaction은 없다. Node validator가 dangling edge를 검사하며, traceability generator가 missing link를 계산한다.

### 5.4 실제 entity와 schema-only entity

| entity | schema | 실제 record | 판정 |
| --- | --- | --- | --- |
| ProductionStateGraph | 있음 | 있음 | 운영 중 |
| ValidationEvidence | 있음 | 20개 | 운영/예제/blocked history 존재 |
| ReviewRecord | 있음 | 있음 | 운영 중 |
| WorkflowExecutionRecord | 있음 | history 존재 | 운영 중; 최신은 benchmark dry-run |
| ProjectDashboard/Traceability/Sync | 있음 | 있음 | graph/evidence에서 파생 |
| HarnessScenario/ValidationDesign | 있음 | 실제 scenario/design 존재 | 운영 및 예제 혼합 |
| AgentRunLog | 있음 | record 파일 없음 | schema-only |
| UnityChangeSet | 있음 | record 파일 없음 | schema-only |
| standalone ProjectState | 있음 | instance 없음 | graph/dashboard가 사실상 대체 |
| standalone TaskGraph | 있음 | instance 없음 | Production State Graph로 통합된 것으로 보임 |

### 5.5 “단순 작업 기록인가, 구조화된 memory인가?”

둘 중에서는 **구조화된 project memory를 지향하며 일부 실제로 수행하는 파일 기반 graph store**가 가장 정확하다. Requirement→Task→UnityTarget→Acceptance→Evidence 관계, health, next action, review, run history가 존재하므로 단순 로그보다 넓다. 그러나 현재 28개 graph link가 누락되고 DRC graph evidence의 내장 상태와 최신 evidence 파일이 어긋나므로, 완전한 단일 진실 공급원이나 자동 동기화 database라고 부를 수는 없다. “파일 기반 구조화된 운영 메모리 + 파생 리포트”가 현재 구현에 맞다.

## 6. Agent Context

### 6.1 Agent가 작업 시작 시 얻는 정보

**Skill/host가 항상 또는 관례적으로 제공하는 정보**

- 최신 사용자 요청과 대화 문맥
- source-of-truth 우선순위
- active feature/requirement/task/acceptance IDs
- 역할별 권한과 handoff packet 형식
- compile/validation loop와 validation level 정의

**파일에서 agent가 선택해 읽는 정보**

- GDD, System Design, Technical Design, Feature Spec
- Scene/Component/Prefab contracts, Input Spec, Project Structure Registry
- Production State Graph, intelligence report, review, evidence, dashboard
- 관련 Unity scripts/assets와 live hierarchy/console/debug state

**코드가 자동 집계하는 정보**

- graph node/edge, missing links, blocked nodes
- evidence status와 validation coverage
- review/benchmark/KPI availability
- Unity health, compile state, console error, hierarchy와 scenario observation

**사용자가 결정하는 정보**

- 창작 의도, feature priority, scope, player-facing change, 최종 승인
- 불명확한 requirement와 subjective quality 기준

### 6.2 Context Pack의 실제 한계

`core/context-pack.mjs`의 실제 payload는 `gddSummary`, `technicalDesignSummary`, `unityState`, `recentChanges`, `openQuestions`뿐이다. Requirement, AC, current task, evidence, screenshot, scene hierarchy를 위한 필드는 없다. 더 중요한 점은 production code에서 `createContextPack` 호출이 발견되지 않았다는 것이다. 따라서 문서에 적힌 풍부한 context-selection 방법론과 자동 prompt assembly 구현을 동일시하면 안 된다.

### 6.3 AI 연결

- MCP 서버는 AI model API를 호출하지 않고 Unity tool만 노출한다.
- `ProviderAdapter`는 interface skeleton이며 OpenAI/Anthropic tool shape converter가 있다.
- concrete provider, credential handling, model selection, conversation persistence, prompt execution loop는 없다.
- 실제 AI는 Codex/Claude 같은 host가 제공하고 AInvil skill이 행동 규칙을 부여한다.

따라서 “AInvil이 자체 AI를 실행해 GDD를 코드로 변환한다”는 설명은 현재 코드로 뒷받침되지 않는다.

## 7. Unity Automation

### 7.1 제어·관찰 범위

| capability | 지원 | 실제 경로/한계 |
| --- | --- | --- |
| Play Mode 진입/종료 | Yes | `unity_enter_play_mode`, `unity_exit_play_mode` |
| scene 전환/저장/목록 | Yes | dirty scene policy는 save/discard/fail로 명시 |
| hierarchy/GameObject 탐색 | Yes | active scene tree와 path 기반 상세 조회 |
| GameObject 생성/수정/삭제 | Yes | primitive/asset-first layout, Undo 사용 |
| component 탐색/추가/삭제 | Yes | type name reflection |
| serialized/public field/property 읽기·쓰기 | Yes | supported JSON type 변환; public reflection 포함 |
| object reference 할당 | Yes | GameObject/component/asset reference |
| public method 호출 | Yes | validation/debug hook에 사용 |
| keyboard 입력/UI button | Yes | Game View event, uGUI onClick invocation |
| runtime input trace/setup hook | Yes | runtime bridge component 필요 |
| scene/prefab/asset/material/animation | Partial | 핵심 생성·조회·prefab override 지원; 전체 Unity API coverage는 아님 |
| ScriptableObject asset | Yes | 기존 type을 찾아 instance 생성 |
| console/exception | Yes | `Application.logMessageReceived` buffer와 compile error normalization |
| compile 상태 | Yes | Editor status + console + optional local `dotnet build` |
| Unity Test Runner | Partial | package가 있을 때 reflection으로 실행 시작; 완료 결과 수집은 별도 없음 |
| runtime state | Partial | 임의 공개 debug-state method 또는 한정 observation type 필요 |
| Game View screenshot | Project-specific | 범용 `unity_capture_game_view` RPC는 없음. DRC probe가 Unity 프로젝트 내부에서 PNG를 생성하고 harness가 파일/치수를 검사함 |
| Scene View screenshot | No evidence | planned documentation에만 존재 |
| audio state | No evidence | API coverage 문서에서 planned |
| profiler/performance | No evidence | API coverage 문서에서 planned |
| build | Project-specific | DRC verification script와 기록은 있으나 일반 bridge `BuildPipeline` RPC는 없음 |

### 7.2 Reflection과 안전 경계

Bridge는 component schema, public method, Test Runner, UI property에 reflection을 사용한다. `unity_invoke_component_method`의 `debugOnly` 기본값은 `false`이므로 caller가 `debugOnly: true`를 보내지 않으면 allowed-prefix policy가 적용되지 않는다. 즉 로컬 사용자 권한 안에서 임의 public instance method 호출이 가능하다. localhost bind, Unity main-thread queue, Undo, batch dry-run, compile gate는 안전 장치지만, 인증과 capability allowlist가 있는 보안 sandbox는 아니다.

### 7.3 이번 조사에서 확인한 실행 상태

- MCP stdio initialize/tools-list 검증: 통과, 52 tools.
- Unity HTTP health `127.0.0.1:17777/health`: 2026-09-05 조사 시점 연결 거부.
- 저장된 2026-07 evidence는 이번 조사에서 재현하지 않았으므로 기록상 사실이다.

## 8. Validation System

### 8.1 validation 조건의 출처

1. `Validation Design` JSON: `validationId`, requirement, acceptance, actions, observations, passCriteria, evidence fields, probes.
2. Harness Scenario JSON: expected documents/artifacts/capabilities, checks, pass criteria, output evidence path.
3. Project-specific hard-coded runner: DRC seeds `[1001, 2026, 7777]`, hook names, numeric assertions.
4. 개발자/사용자 수동 리뷰: human playability와 public release 판단.

따라서 acceptance criteria에서 자동으로 모든 검증 코드를 생성하는 것이 아니다. 일반 observation runner와 DRC 전용 코드가 공존한다.

### 8.2 실제 loop

```text
Scenario + optional Validation Design
  → Bridge health/stability
  → refresh assets
  → Unity compile status + console + local C# build
  ├─ failed: Blocked evidence, playModeAttempted=false
  └─ passed: inspect/build/open scene
       → enter Play Mode
       → send input / invoke validation hooks
       → collect before/after observations
       → evaluate assertions
       → console check
       → exit Play Mode
       → write latest + status-classified ValidationEvidence
```

`ValidationEvidence`에는 status, validationLevel, failureClass, linked requirement/acceptance IDs, Unity targets, checks, timestamps, remaining gaps, next actions가 필요하다. validator는 Passed evidence에 non-passed check가 있거나 AC link/assertion이 없으면 실패시킨다. `Runtime Tested`는 PlayMode/Input check를 요구한다.

### 8.3 상태 모델

| 개념 | 실제 지원 | 자동 무효화 여부 |
| --- | --- | --- |
| Planned / In Progress / Implemented / Validated | graph status에 있음 | node 작성/갱신 주체가 설정 |
| Blocked / Deferred / Cut | graph status에 있음 | 자동 해소 아님 |
| Needs Requirement/Acceptance/validation | graph status 및 generator 결과 | 일부 자동 탐지 |
| Compile Verified / Play Mode Verified / Visual Verified / Runtime Tested / User Confirmed | validation level에 있음 | evidence/report가 설정 |
| Stale / Superseded | schema에 있음 | 현재 graph 사용 사례 0; 새 구현 시 자동 stale 처리 코드 미확인 |
| Pass/Fail/Blocked | evidence에 있음 | harness 결과에서 산출 |

현재 naming에는 불일치가 있다. graph embedded evidence는 `Pass/Fail`을, standalone evidence는 `Passed/Failed`를 사용한다. graph validator는 구조적 유효성을 통과시키지만, `EVID-DRC-PROC-001` node 자체는 `Validated`이면서 embedded evidence는 `Not tested`, timestamp null이다. 외부 최신 evidence는 실제로 `Passed`, `Play Mode Verified`다. 파생 traceability는 외부 evidence를 읽어 Passed로 보지만 graph 내장 데이터는 갱신되지 않았다.

### 8.4 저장된 검증 기록의 해석

**[기록상 사실]** DRC procedural recovery evidence는 2026-07-06에 `Passed / Play Mode Verified`, compile error 0, console error 0, stale evidence false를 기록했다. 세 seed는 4~5 rooms, 3 targets, 3 reachable targets, duplicate 0, deterministic match, job complete를 기록했다. visual evidence는 5 screenshots, `Visual Verified`, `humanReviewRequired: true`, `publicReleaseReady: false`를 기록했다.

**[확인 사실]** 최신 live harness report는 2026-07-06의 Example `top_down_collectible` 실행이며 `Failed`다. 대상 Unity 프로젝트에서 sample `PlayerController`와 runtime input bridge component를 찾지 못했다. 이는 DRC의 classified passed evidence를 지우지는 않지만 “최신 harness가 모두 통과한다”는 주장과 충돌한다.

## 9. Human / AInvil / AI Boundary

범례: `Primary` 주 책임, `Assisted` 제안/도구 제공, `Automated` 코드가 직접 수행, `Not Supported` 일반 기능 없음.

| 작업 | Developer | AInvil | AI Agent | 근거/경계 |
| --- | --- | --- | --- | --- |
| 게임 규칙 결정 | Primary | Assisted | Assisted | 사용자 승인 없는 player-facing 변경 금지 |
| GDD 작성 | Primary approval | Assisted | Primary drafting | skill/template 기반; deterministic generator 없음 |
| Technical Design | Primary approval | Assisted | Primary drafting | GDD Agent workflow; source-of-truth 우선순위 |
| Requirement/AC 정의 | Primary approval | Assisted | Primary drafting | IDs/BDD를 skill이 요구; graph가 저장 |
| Task 분해 | Assisted | Assisted | Primary | graph/task schema는 구조 제공 |
| 관련 코드 선택 | Assisted | Not Supported as runtime | Primary | automatic repository retrieval 미확인 |
| 코드 작성 | Assisted/review | Tooling only | Primary | AInvil core 자체 code generator/provider 없음 |
| scene/prefab/asset 조작 | Oversight | Automated tool execution | Primary planning/calls | Unity RPC가 mutation 수행 |
| Compile 확인 | Oversight | Automated | Assisted | compile gate가 Editor/console/dotnet 결과 통합 |
| Runtime 검사 | Oversight | Automated probes | Primary interpretation | project hook/observation 필요 |
| Visual 판정 | Primary final | Partial automation | Assisted | screenshot/수치 assertion + human review required |
| 실패 수정 방향 | Primary for scope | Assisted next-action | Primary proposal/implementation | 범용 자동 repair loop 없음 |
| 최종 승인/출시 | Primary | Not Supported | Assisted | publicReleaseReady를 자동 true로 만들지 않음 |

핵심 책임 경계는 “AI가 모두 결정”이 아니다. 개발자는 창작 의도와 승인권을 갖고, host AI는 문서·코드·작업 제안을 수행하며, AInvil은 상태 구조·Unity 도구·gate·증거 형식을 제공한다.

## 10. End-to-End Trace

가장 증거가 많은 사례는 `Dungeon Recovery Company procedural recovery job E2E`다.

| 단계 | 실제 연결 | 상태 | 증거 |
| --- | --- | --- | --- |
| Game Design | scenario의 `userGoal`과 graph Feature summary | **끊김** | 실제 GDD 문서 및 GDD section ref가 현재 AInvil/연결 Unity 프로젝트에서 확인되지 않음 |
| Technical Design | scenario `expectedDocuments`에 설명 | **기록 기대치만 있음** | 실제 Technical Design artifact/ref 없음 |
| Feature | `FEAT-DRC-PROC-RecoveryJob` | 있음 | graph, Implemented |
| Requirement | `REQ-DRC-PROC-001..010` | 있음 | graph + scenario IDs |
| Feature Spec | 없음 | **끊김** | traceability report가 DRC 행을 `Needs Feature Spec`으로 분류 |
| Task | `TASK-DRC-PROC-001..008` | 부분 연결 | `003`, `004` requirement는 validator 기준 task link 누락; 여러 task는 UnityTarget mapping 누락 |
| Acceptance | `AC-DRC-PROC-001..010` | 있음, 연결 불균일 | AC 001..008이 graph상 주로 REQ-001에 연결되어 requirement별 trace가 왜곡됨 |
| AI Implementation | source 생성 과정 | **증거 부족** | 저장된 과거 prompt/agent run 없음. AgentRunLog instance도 없음 |
| Unity artifacts | scene/controller/player/builder | 현재 파일 존재 확인 | 외부 Unity project의 실제 scene와 C# files 확인 |
| Scene construction | builder public method 호출 | 자동화됨 | harness → `unity_invoke_component_method(BuildProceduralRecoveryJobScene)` |
| Compile gate | bridge health, refresh, compile, console, dotnet build | 자동화됨 | `runUnityValidationPreflight` |
| Runtime validation | seed/random seed/generation/recovery hooks | 자동화됨 | `GenerateWithSeed`, `ValidationCompleteAllTargets`, Play Mode |
| Evidence | linked REQ/AC/targets/checks/timestamps | 있음 | standalone evidence Passed, stale false |
| Graph sync | evidence node/edges | **불일치** | node status Validated이나 embedded evidence `Not tested`; 최신 evidence는 Passed |
| Revision/revalidation | classified latest-passed/latest-blocked 보존 | 부분 지원 | history file은 있으나 implementation revision과 자동 stale/supersede 연결 없음 |

실제 이동 정보는 다음처럼 요약된다.

```text
Scenario userGoal + REQ/AC IDs + expected Unity paths
  → harness calls existing builder/controller methods
  → Unity scene, compile state, runtime state, console data
  → per-check assertions + timestamps + failure class
  → ValidationEvidence JSON
  → traceability/dashboard readers
```

이 사례는 요구사항에서 검증까지의 연결 가능성을 보여주지만 GDD, Technical Design, Feature Spec, 최초 AI implementation 기록이 빠져 있어 요청한 전체 chain의 완전한 사례는 아니다.

## 11. Action Required Integration

**[개발자 확인 사실 — 기존 저장소 탐색보다 우선]** Action Required는 AInvil plugin/runtime과 Unity MCP를 실제 제작 과정에 사용했다. 현재 접근 가능한 별도 Unity 프로젝트에서는 GDD, Feature Spec, 요구·작업·수용 ID, 코드와 최신 Unity 검증 기록을 확인했다. 다만 사용 버전, MCP 호출 횟수, 모든 코드가 AInvil을 통해 생성됐는지, 당시 PSG node 구성이 현재와 같았는지는 주장하지 않는다.

| AInvil capability | Action Required actual artifact |
| --- | --- |
| Requirement/Task/Acceptance IDs | `REQ-*`, `TASK-*`, `AC-*` 문서와 코드 연결 |
| Validation Design/Evidence | `Validation_Report.md`, MaskOnly/Final captures |
| Function Mapping | Technical Design, component 책임, 코드/Unity 대상 연결 |
| Unity Execution | Unity MCP 직접 사용 · 개발자 확인 |

## 12. Strongest Portfolio Evidence

### 12.1 Candidate Differentiators (최대 5개)

#### 1. Requirement-to-evidence graph

**주장**  
AInvil은 feature, requirement, task, Unity target, acceptance criterion, evidence를 ID graph로 연결하고 누락 링크를 보고한다.

**근거**  
`production_state_graph.schema.json`, 실제 104-node graph, `traceability-view.mjs`, CLI graph/traceability 결과.

**한계**  
현재 28 graph links가 누락되고 traceability 40행 중 Complete는 1행이다. 연결 생성·수정은 완전 자동이 아니다.

#### 2. Compile-gated Play Mode validation

**주장**  
AInvil은 Unity runtime 검증 전에 bridge, asset refresh, compile, console, local C# build를 검사하고 compile 실패 시 Play Mode를 차단한다.

**근거**  
`core/unity-compile-gate.mjs`, compile-blocked evidence의 `playModeAttempted:false`, safety regression evidence.

**한계**  
Unity Editor/bridge와 생성된 csproj, local dotnet 환경에 의존한다. 이번 조사에서 live bridge는 연결되지 않았다.

#### 3. Machine-readable runtime evidence

**주장**  
AInvil은 Play Mode hook의 전후 상태, assertion, console error, timestamp, requirement/acceptance IDs를 evidence JSON으로 남긴다.

**근거**  
`validation_evidence.schema.json`, `run-ainvil-live-harness.mjs`, DRC procedural evidence.

**한계**  
검증 hook과 scenario 작성이 필요하며, 범용 gameplay understanding이 자동 생성되는 것은 아니다.

#### 4. Local Unity automation layer

**주장**  
AInvil은 MCP를 통해 scene/object/component/prefab/asset/UI/input/test/compile 작업을 Unity main thread에 전달한다.

**근거**  
52 MCP tools, `CodexUnityBridgeServer.Dispatch`, Runtime Input Test Bridge.

**한계**  
localhost 신뢰 경계, 공개 method reflection, 제한된 API coverage를 가진다. audio/profiler/범용 screenshot은 없다.

#### 5. Human approval and release boundary

**주장**  
AInvil은 검증 evidence와 사용자 결정을 분리하며, 시각 검증이 통과해도 human review와 public release를 자동 승인하지 않는다.

**근거**  
workflow approval classes, `humanReviewRequired`, `publicReleaseReady:false`, review lifecycle.

**한계**  
이는 주로 workflow rule과 report field로 강제된다. 외부 사용자가 파일을 직접 수정하는 것까지 막는 transaction/authorization layer는 없다.

### 12.2 포트폴리오에 보여줄 7개 핵심 증거

| 보여줄 것 | 전달되는 메시지 | 근거 |
| --- | --- | --- |
| 실제 graph 일부와 ERD | 요구사항과 증거가 별도 entity로 연결된다 | graph/schema |
| CLI graph 결과: 104 nodes, 122 edges, 28 gaps | 성공뿐 아니라 누락도 보고한다 | `ainvil-cli graph` |
| MCP→HTTP→Unity main-thread diagram | AI 호출이 Unity API에 도달하는 구체적 경로가 있다 | server + Editor bridge |
| compile-blocked evidence | compile 실패에서 runtime claim을 멈춘다 | compile gate/evidence |
| DRC seed별 evidence table | runtime 결과가 자연어가 아니라 값과 assertion으로 남는다 | DRC evidence |
| visual screenshots + `humanReviewRequired` | 자동 시각 check와 인간 품질 판단을 분리한다 | visual evidence/screenshots |
| graph/evidence 불일치 사례 | 현재 한계와 sync 문제를 숨기지 않는다 | `EVID-DRC-PROC-001` vs latest evidence |

### 12.3 사용할 수 없는 과장된 주장

- “AInvil이 게임 기획부터 출시까지 모두 자동화한다.”
- “GDD를 입력하면 자동으로 Technical Design과 완성 코드를 생성한다.”
- “모든 Unity 동작과 시각·오디오·성능을 AI가 실시간 검증한다.”
- “프로젝트 database가 구현·문서·evidence를 항상 자동 동기화한다.”
- “검증 통과가 사용자 품질 승인 또는 public release readiness를 의미한다.”
- “AInvil 자체가 AI provider/model runtime이다.”

## 13. Limitations

### 13.1 현재 확인된 한계

1. **기획 자동화는 agent instruction 중심이다.** GDD/Technical Design/Feature Spec template는 있지만 deterministic conversion runtime은 없다.
2. **AI provider가 구현되지 않았다.** `ProviderAdapter`는 abstract skeleton이며 concrete model integration이 없다.
3. **graph가 완전하지 않다.** 28개 missing links, 1/40 Complete traceability rows, DRC FeatureSpec 부재가 있다.
4. **증거 동기화가 불완전하다.** 외부 evidence와 graph embedded status/timestamp가 어긋난다.
5. **revision/stale가 schema 수준에 머문다.** supersedes/Stale/Superseded 상태는 정의되지만 현재 graph에서 사용되지 않고 자동 invalidation을 확인할 수 없다.
6. **변경 추적 schema가 운영되지 않는다.** `UnityChangeSet`과 `AgentRunLog`는 schema만 있고 instance가 없다. 최초 prompt와 code authorship을 복원할 수 없다.
7. **workflow executor 범위가 좁다.** 첫 guarded executor는 `RunBenchmark`만 실행한다. 일반 task 생성, coding, repair, graph patch는 지원하지 않는다.
8. **validation은 hook 의존적이다.** DRC 성공은 프로젝트별 builder/controller/probe가 이미 존재해야 한다.
9. **최신 harness 실패가 있다.** sample component/package mismatch로 example scenario가 Failed다.
10. **live state는 현재 확인하지 못했다.** 조사 시 Unity bridge health가 연결 거부였다.
11. **범용 시각/오디오/성능 API가 없다.** DRC screenshot은 project-specific probe이고 Scene View/audio/profiler는 planned다.
12. **public method invocation 경계가 넓다.** `debugOnly` 기본 false라 validation prefix allowlist가 opt-in이다.
13. **file-store의 transaction/locking이 없다.** 여러 agent/process가 같은 JSON을 갱신할 때 충돌 방지 근거가 없다.
14. **canonical/mirror drift가 있다.** manifest가 canonical로 지정한 plugin Unity package와 deprecated root mirror의 Editor server hash가 다르다.
15. **현재 작업 트리에는 uncommitted 기능이 있다.** Dynamic UI Creator 관련 파일 일부는 untracked이므로 배포된 release와 동일하다고 가정하면 안 된다.

### 13.2 확인 가능한 설계 판단과 추론 한계

| 관찰된 선택 | 코드가 말하는 것 | 의도 판정 |
| --- | --- | --- |
| GDD/Technical Design 분리 | 별도 template와 source-of-truth 순서 | 목적은 [개발자 확인 필요] |
| Requirement/Task/AC/Evidence 분리 | graph node/edge와 validator가 실제 강제 | traceability 목적은 문서에도 명시 |
| graph + Markdown 병행 | graph는 operational view, 설계 문서가 상위 권한 | [확인 사실] |
| validation을 implementation과 분리 | 별도 Input Agent, evidence schema, gate | [확인 사실]; 조직적 이유는 확인 필요 |
| user approval 유지 | approval class와 publicReleaseReady false | [확인 사실] |
| localhost HTTP bridge | 외부 agent와 Unity main thread 분리 | [확인 사실]; HTTP 선택 이유는 확인 필요 |
| project-specific debug hook | deterministic state를 읽고 재현 가능 | [추론] 검증 안정성 목적; 최초 판단은 확인 필요 |

## 14. Developer Questions

다음 질문은 저장소만으로 답을 확정할 수 없다.

1. [개발자 확인 필요] GDD와 Technical Design을 분리한 최초 문제 경험은 무엇이었는가?
2. [개발자 확인 필요] 자유형 prompt 대신 ID graph를 도입하게 된 구체적 실패 사례가 있었는가?
3. [개발자 확인 필요] Production State Graph를 SQL/SQLite가 아닌 JSON file store로 선택한 이유와 동시성 전략은 무엇인가?
4. [개발자 확인 필요] DRC 구현 C#은 어느 agent/run/prompt에서 작성되었으며, 사람이 수정한 구간은 어디인가?
5. [개발자 확인 필요] GDD→Technical Design→Requirement graph 동기화를 향후 자동화할 계획인가, 의도적으로 human-in-the-loop로 남기는가?
6. [개발자 확인 필요] evidence file이 갱신될 때 graph embedded evidence를 갱신하지 않은 것은 미완성 sync인가, derived-view 우선 설계인가?
7. [개발자 확인 필요] implementation revision이 바뀌면 이전 evidence를 Stale/Superseded로 전환할 authoritative revision key는 무엇인가?
8. [개발자 확인 필요] `unity_invoke_component_method.debugOnly`를 기본 false로 둔 이유와 운영 보안 경계는 무엇인가?
9. [개발자 확인 필요] DRC 전용 harness를 다른 게임 feature에 일반화할 최소 abstraction은 무엇인가?
10. [개발자 확인 필요] Visual Verified와 human playability review가 각각 답해야 하는 질문은 무엇인가?
11. [개발자 확인 필요] Dynamic UI Creator는 0.6.0 release 일부인가, 아직 RFC/working-tree prototype인가?
12. [추가 증거 확보 항목] Action Required 제작 당시 사용 버전과 run/evidence revision을 보존할 수 있는 authoritative key는 무엇인가?

## 15. Portfolio Information Architecture

포트폴리오는 “AI가 게임을 만들어 준다”가 아니라 “설계 의도와 검증 증거 사이의 정보 흐름을 어떻게 구조화했는가”를 중심으로 구성하는 것이 현재 구현과 맞다.

### 15.1 Overview — AInvil의 정확한 정의

**방문자가 알아야 할 한 가지 사실**  
AInvil은 host AI, file-based production memory, Unity automation, validation evidence를 연결하는 개발 도구다.

**보여줄 실제 자료**  
4-layer architecture diagram과 정확한 한 문장 정의.

**설명(2~4문장)**  
AInvil 자체가 AI model을 제공하지는 않는다. 대신 agent가 따라야 할 production method, Unity에서 실행할 도구, 요구사항과 검증 증거를 연결할 상태 모델을 제공한다. 결과적으로 코드 생성보다 “무엇을 왜 구현했고 어디까지 검증했는가”를 남기는 데 초점이 있다.

**상세 페이지**  
Plugin/CLI/MCP/Unity package 구성.

### 15.2 Methodology — 사람과 AI의 책임

**한 가지 사실**  
사용자가 창작 의도와 승인권을 보유하고 agent와 AInvil의 책임이 분리되어 있다.

**보여줄 자료**  
Human/AInvil/AI boundary 표와 source-of-truth 순서.

**설명**  
AI는 문서와 코드를 제안·작성할 수 있고 AInvil은 상태와 실행/검증 도구를 제공한다. 범위, player-facing behavior, 최종 승인은 개발자에게 남는다.

**상세 페이지**  
review lifecycle, approval classes, handoff packet.

### 15.3 Architecture — 정보가 이동하는 경로

**한 가지 사실**  
자연어 의도는 graph ID와 Unity target, evidence record로 점차 구체화된다.

**보여줄 자료**  
`Feature→Requirement→Task→UnityTarget→AC→Evidence` ERD 및 MCP 통신도.

**설명**  
Production State Graph는 운영 메모리이고 Markdown은 설계 의미의 source-of-truth다. Unity 결과는 HTTP RPC를 통해 관찰되고 JSON evidence로 돌아온다.

**상세 페이지**  
schema field, edge semantics, missing-link detector.

### 15.4 One End-to-End Example — DRC Procedural Recovery

**한 가지 사실**  
세 seed에 대해 scene 준비, compile, Play Mode hook, reachability/job-complete assertion, evidence 기록이 이어진 사례가 있다.

**보여줄 자료**  
seed 결과 표, actual C# hook, evidence JSON, screenshot 일부.

**설명**  
저장 기록은 세 seed의 deterministic generation, 3 targets, reachability, job completion, zero console errors를 보여준다. 동시에 GDD/Technical Design/FeatureSpec link가 비어 있음을 표시해 완전한 chain으로 과장하지 않는다.

**상세 페이지**  
scenario checks, validation hook, pass/fail evidence history.

### 15.5 Validation — 완료 주장의 근거

**한 가지 사실**  
compile, Play Mode, visual, user confirmation은 서로 다른 validation level이다.

**보여줄 자료**  
compile gate 흐름, blocked evidence, `humanReviewRequired/publicReleaseReady` 필드.

**설명**  
Compile Verified는 gameplay success가 아니고 Visual Verified는 human acceptance가 아니다. AInvil은 이 차이를 상태와 evidence에 기록한다.

**상세 페이지**  
Validation Design schema, evidence validator, failure classification.

### 15.6 Honest Limits — 아직 연결되지 않은 부분

**한 가지 사실**  
현재 구현은 완성된 autonomous pipeline이 아니라 작동하는 여러 production subsystem과 미완성 sync의 조합이다.

**보여줄 자료**  
CLI의 28 missing links, traceability 1/40 Complete, graph/evidence mismatch, 최신 example harness failure.

**설명**  
이 한계는 제품의 실패를 숨기기 위한 부록이 아니라 다음 기술 과제를 설명하는 핵심 자료다. 특히 revision-aware evidence invalidation과 design-document ingestion이 다음 구조적 문제로 보인다.

**상세 페이지**  
roadmap이 아니라 실제 gap별 해결 후보와 검증 기준.

### 15.7 Action Required Application

`Tooling + Workflow Application`으로 별도 case study에 연결한다. AInvil plugin/runtime과 Unity MCP의 실제 사용, 요구·코드·검증 연결을 보여주되 버전·호출 횟수·코드 생성 비율·당시 PSG 구성을 과장하지 않는다.

---

## 조사에 사용한 핵심 근거

- Plugin manifest: `plugins/ainvil/.codex-plugin/plugin.json`
- Agent methodology: `plugins/ainvil/skills/orchestrator/SKILL.md`, `gdd-agent/SKILL.md`, `unity-agent/SKILL.md`, `input-agent/SKILL.md`
- Production graph/schema: `plugins/ainvil/state/production_state_graph.json`, `plugins/ainvil/schemas/production_state_graph.schema.json`
- Traceability: `plugins/ainvil/core/traceability-view.mjs`, `plugins/ainvil/reports/traceability_view.json`
- Workflow gates: `plugins/ainvil/core/workflow-approvals.mjs`, `workflow-executor.mjs`, `workflow-runtime.mjs`
- Unity bridge: `plugins/ainvil/mcp-server/server.mjs`, `plugins/ainvil/unity-package/Packages/com.codex.unity-bridge/Editor/CodexUnityBridgeServer.cs`
- Runtime input: `plugins/ainvil/unity-package/Packages/com.codex.unity-bridge/Runtime/AInvilRuntimeInputTestBridge.cs`
- Compile gate: `plugins/ainvil/core/unity-compile-gate.mjs`
- Validation: `plugins/ainvil/schemas/validation_design.schema.json`, `validation_evidence.schema.json`, `plugins/ainvil/scripts/run-ainvil-live-harness.mjs`
- DRC trace: `plugins/ainvil/harness/scenarios/dungeon_recovery_procedural_recovery_job_e2e.json`, `plugins/ainvil/validation/evidence/EVID-dungeon-recovery-procedural-recovery-job-e2e-latest.json`
- Current gaps: `plugins/ainvil/reports/production_intelligence_report.json`, `project_dashboard.json`, `release_readiness_report.json`, `harness/reports/latest-live-harness-report.json`
- UI authoring: `plugins/ainvil/ui-creator/`, `plugins/ainvil/schemas/ui_layout.schema.json`, `plugins/ainvil/reports/ui_v2_validation_report.md`

## 재현한 정적 검사

```text
Production state graph validation passed (104 nodes, 122 edges).
Validation evidence validation passed (20 files).
MCP server validation passed (52 tools).
Sample UI Layout validation passed (2 screens, 8 elements).
CLI graph: 28 missing links.
CLI traceability: 40 rows, Complete 1.
Unity HTTP health at investigation time: unreachable/connection refused.
```

이 검사들은 schema·파일·MCP protocol 수준을 확인한다. 저장된 2026-07/08 Play Mode 및 browser 기록을 2026-09-05에 다시 실행한 것은 아니다.
