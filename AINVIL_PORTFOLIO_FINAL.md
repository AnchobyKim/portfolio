# AInvil

## 01 HERO

게임 규칙을 분석해 구현 책임과 Unity 대상을 정리하고, 실행 결과를 검증 증거로 되돌리는 AI-assisted game development workflow.

AInvil은 AI 모델이나 “GDD를 곧바로 코드로 바꾸는 생성기”가 아니다. 개발자의 의도를 Host AI가 구현할 수 있는 구조와 도구, 상태, 검증 경로로 연결한다.

`Codex Plugin · Node.js · MCP · Unity Editor · JSON Schema · Local HTTP RPC`

## 02 DEVELOPMENT METHOD

| Stage | Developer | Host AI | AInvil |
| --- | --- | --- | --- |
| Game Rules | Decide · 의도/범위 | Analyze · 질문/대안 | Structure · GDD/규칙 형식 |
| Function Mapping | Approve · 책임 경계 | Draft · 클래스/메서드/대상 | Trace · ID/계약/관계 |
| Code Generation | Review · 채택 판단 | Primary · 코드/수정 | Context · 문서/핸드오프 |
| Unity Execution | Authorize · 작업 범위 | Operate · 도구 호출 | Bridge · MCP/RPC |
| Validation | Judge · 완료 판단 | Interpret · 결과/수정안 | Record · gate/evidence |

## 03 HOW IT WORKS

```text
GDD / Game Rules → Requirement Analysis → Function Mapping
→ Implementation Plan → Code Generation → Unity Execution
→ Validation / Evidence
```

```text
Host AI → MCP stdio → AInvil MCP Adapter
→ localhost HTTP RPC → Unity Main Thread
```

### Methodology vs Current Implementation

- Methodology: GDD와 규칙을 분석해 기능 책임, 클래스·메서드 이름, Unity 대상을 먼저 매핑하고 Host AI의 구현 계획과 코드 생성을 구조화한다.
- Current Implementation: 책임·클래스·Public API는 Technical Design, Component Contract, Scene Blueprint에 기록된다. PSG에는 전용 FunctionMapping 노드가 없고 `Requirement → ImplementationTask → UnityTarget` 관계로 구현 대상을 추적한다. 문서와 핸드오프 컨텍스트가 Host AI에 전달된다.

## 04 PRODUCTION STATE GRAPH

### 하나의 게임 규칙이 검증될 때까지

```text
모든 회수 목표는 도달 가능해야 한다.  REQ-DRC-PROC-007
→ 도달 가능한 목표 배치             TASK-DRC-PROC-004
→ Recovery Job Builder              AInvilProceduralRecoveryJobBuilder
→ 도달 가능 목표 3개                AC-DRC-PROC-004
→ 3 / 3 PASS                        seed 1001 / 2026 / 7777
```

- `104 Nodes`: 추적 중인 제작 사실
- `122 Edges`: 사실 사이의 관계
- `28 Missing Links`: 아직 보완할 요구·구현·검증 연결

## 05 VALIDATION

`Compile Verified ≠ Unity Inspected ≠ Runtime Tested ≠ Visual Tested ≠ User Confirmed`

특정 테스트 분기의 PASS만으로 전체 수용 기준을 완료 처리하지 않는다.

## 06 REAL PROJECT

Dungeon Recovery Company의 procedural recovery job에서 compile gate, Play Mode hook, seed `1001 / 2026 / 7777`에 대해 목표 3개, 도달 가능 3개, 중복 0, deterministic PASS를 실행 기록으로 남겼다.

현재 기록은 Requirement→Runtime Evidence 구간을 증명한다. GDD, Feature Spec, 최초 implementation provenance는 완전히 연결되어 있지 않다.

## 07 CURRENT LIMITS

| Area | Current | Next |
| --- | --- | --- |
| Function Mapping | 문서·Agent-assisted | 전용 schema / graph projection |
| Evidence Versioning | Graph ↔ evidence drift 가능 | Revision-key stale invalidation |
| Validation Coverage | Compile / Runtime 중심 | Game View · Audio · Profiler |

## 08 APPLIED PROJECTS

**Dungeon Recovery Company — Tooling + Runtime Evidence**  
AInvil Unity Bridge, harness, evidence가 직접 연결된 사례.

**Action Required — Tooling + Workflow Application**  
Action Required는 AInvil plugin/runtime과 Unity MCP를 실제 제작 과정에 사용한 프로젝트다. 구체적인 버전·호출 횟수·전체 코드 중 생성 비율은 추정하지 않는다.
