# AInvil

## Hero

**게임 설계 의도, Unity 구현 대상, 검증 증거를 한 흐름으로 관리하는 AI 게임 제작 워크플로.**

AInvil은 Codex Plugin, Node.js CLI, MCP adapter, Unity Editor extension, JSON Schema 기반 상태 파일로 구성된다. AI 모델은 포함하지 않는다. 문서와 코드는 host AI가 제안하고, AInvil은 작업 구조·Unity 조작·검증 단계·증거 형식을 제공한다.

- 기술: Codex Plugin · Node.js · MCP · Unity Editor · JSON Schema · localhost HTTP RPC
- 현재 검증: 정적 검사와 MCP handshake 완료. 조사 시 Unity Bridge는 오프라인이어서 새 Play Mode 검증은 하지 않음.
- 추천 diagram: `설계 문서 → Host AI → AInvil → Unity → Evidence` 한 줄 개요
- 추천 screenshot / evidence: CLI graph 요약과 Unity Editor가 함께 보이는 대표 이미지
- 상세 링크 후보: `plugins/ainvil/.codex-plugin/plugin.json`, `plugins/ainvil/README.md`

## What I Built

AInvil은 네 부분을 묶는다.

1. GDD·Technical Design·Feature Spec을 다루는 agent workflow
2. Requirement·Task·UnityTarget·Acceptance·Evidence를 연결하는 파일 기반 운영 메모리
3. Unity Editor를 로컬에서 조작하는 MCP/HTTP bridge
4. compile, Play Mode, assertion 결과를 구분해 저장하는 validation pipeline

GDD를 코드로 자동 변환하는 엔진은 아니다. 개발자가 규칙과 승인 기준을 정하고, host AI가 문서·코드 작업을 수행하도록 실행 경계를 만든 도구다.

- 추천 diagram: Plugin / Workflow Runtime / Unity Bridge / State & Evidence의 4분할 구성도
- 추천 screenshot / evidence: plugin manifest와 CLI help를 나란히 배치
- 상세 링크 후보: `plugins/ainvil/core`, `plugins/ainvil/workflow`, `plugins/ainvil/schemas`

## Development Method

```text
Game Design             Developer 결정 · AI 초안 보조
    ↓
Technical Design        AI 작성 가능 · Developer 승인
    ↓
Implementation          Host AI 작업 · AInvil은 Unity 도구와 상태 제공
    ↓
Live Validation         AInvil 실행 · AI 해석 · Developer 최종 판단
    ↓
Revision                Developer가 범위와 채택 여부 결정
```

핵심은 코드를 많이 생성하는 데 있지 않다. 플레이 규칙을 요구사항으로 나누고, 구현 위치와 수용 조건을 연결하고, 완료 판단의 근거를 남기는 데 있다.

- 추천 diagram: 단계별 주 책임자를 색으로 나눈 pipeline
- 추천 screenshot / evidence: GDD, Feature Spec, validation evidence의 동일 ID 연결 예시
- 상세 링크 후보: `plugins/ainvil/skills/orchestrator/SKILL.md`, `plugins/ainvil/templates`

## Architecture

```text
Developer
   ↕
Host AI Agent
   ├─ AInvil skills / templates
   ├─ Node.js CLI / workflow runtime
   ├─ Production State Graph / reports
   └─ MCP stdio
          ↓
     MCP adapter
          ↓ localhost HTTP RPC
     Unity Editor extension
          ↓ main thread
     Scene · Component · Prefab · Play Mode · Input
```

Node.js 쪽은 상태와 보고서를 다루고, Unity package는 Editor API와 runtime test hook을 제공한다. 두 영역은 stdio MCP와 localhost RPC로 연결된다.

- 추천 diagram: 위 통신 구조를 하나의 세로형 architecture diagram으로 제작
- 추천 screenshot / evidence: `server.mjs` tool 목록과 Unity bridge health 응답
- 상세 링크 후보: `plugins/ainvil/mcp-server/server.mjs`, `plugins/ainvil/unity-package/Packages/com.codex.unity-bridge`

## Production State Graph

```text
Feature → Requirement → ImplementationTask → UnityTarget
              ↓
     AcceptanceCriterion → ValidationEvidence
```

실제 graph는 104 nodes, 122 edges를 가진다. CLI는 연결 누락 28개를 보고했고, traceability 40행 중 `Complete`는 1행이었다. AInvil은 성공 상태만 표시하지 않고 빠진 설계·구현·검증 연결도 다음 작업으로 드러낸다.

이 구조는 데이터베이스 서버가 아니라 versioned JSON과 JSON Schema로 구현된 파일 기반 운영 메모리다.

- 추천 diagram: node type과 실제 ID 하나를 넣은 graph 확대도
- 추천 screenshot / evidence: `104 nodes / 122 edges / 28 missing links` CLI 출력
- 상세 링크 후보: `plugins/ainvil/state/production_state_graph.json`, `plugins/ainvil/schemas/production_state_graph.schema.json`, `plugins/ainvil/reports/traceability_view.json`

## Unity Bridge

```text
Host AI Agent
      ↓ MCP stdio
AInvil MCP Adapter
      ↓ localhost HTTP RPC
Unity Editor Main Thread
      ↓
Scene / GameObject / Component / Prefab / Asset / Play Mode / Input
```

MCP handshake에서 52개 Unity tool schema를 확인했다. Bridge는 scene과 component 편집, prefab 작업, asset 생성, compile 상태 확인, Play Mode 전환, runtime input hook 호출을 지원한다. 로컬 신뢰 환경을 전제로 하며 별도 인증은 없다.

- 추천 diagram: 요청과 응답이 왕복하는 MCP→HTTP→Unity sequence
- 추천 screenshot / evidence: MCP `tools/list` 결과와 Unity Console 상태
- 상세 링크 후보: `plugins/ainvil/mcp-server/server.mjs`, `CodexUnityBridgeServer.cs`, `AInvilRuntimeInputTestBridge.cs`

## Validation Pipeline

```text
Compile Gate
    ↓
Play Mode
    ↓
Runtime Hook / Input
    ↓
Observation + Assertion
    ↓
Evidence JSON
```

```text
Compile Verified ≠ Runtime Tested ≠ Visual Verified ≠ User Confirmed
```

컴파일 실패 시 Play Mode로 넘어가지 않는다. Runtime evidence는 requirement와 acceptance ID, 실행 시각, 관찰값, assertion, Console 상태, 남은 공백을 기록한다. 화면 검증이 끝나도 사람의 승인과 공개 가능 상태는 별도다.

- 추천 diagram: gate별 실패 지점과 evidence status를 표시한 validation flow
- 추천 screenshot / evidence: DRC seed별 assertion JSON과 `publicReleaseReady: false`
- 상세 링크 후보: `plugins/ainvil/scripts/run-ainvil-live-harness.mjs`, `plugins/ainvil/schemas/validation_evidence.schema.json`

## Human / AI / AInvil Boundary

| Work | Developer | Host AI | AInvil |
| --- | --- | --- | --- |
| 게임 규칙·범위 | 결정 | 대안·문서 초안 | 템플릿과 상태 구조 |
| Technical Design | 승인 | 초안·수정 | ID와 연결 형식 |
| 코드·Unity 변경 | 검토·채택 | 주 작업자 | Unity 도구·실행 경계 |
| Runtime 검증 | 기준 승인 | 결과 해석·수정 제안 | gate·hook·evidence 저장 |
| 화면·플레이 감각 | 최종 판단 | 비교·진단 보조 | 증거 위치와 상태 기록 |
| 공개 승인 | 최종 책임 | 의견 | 자동 승인하지 않음 |

AInvil의 `ProviderAdapter`는 interface skeleton이며 실제 모델 provider는 없다. 창작 결정은 개발자, 문서와 코드 작업은 host AI, 상태·Unity 실행·검증 형식은 AInvil이 맡는다.

- 추천 diagram: 세 주체의 책임을 겹치지 않게 배치한 swimlane
- 추천 screenshot / evidence: human review와 release readiness가 분리된 evidence 일부
- 상세 링크 후보: `plugins/ainvil/core/provider-adapter.mjs`, `plugins/ainvil/skills`

## End-to-End Example

Dungeon Recovery Company의 procedural recovery job은 현재 가장 긴 실행 기록이다.

```text
REQ-DRC-PROC-001..010
    ↓
Unity scene preparation + compile gate
    ↓
Play Mode hooks: GenerateWithSeed / CompleteAllTargets
    ↓
seed 1001 · 2026 · 7777 assertions
    ↓
Passed / Play Mode Verified evidence
```

세 seed에서 방 4~5개, 목표 3개, 도달 가능한 목표 3개, 중복 0, 결정성 일치, 작업 완료가 기록됐다. 다만 실제 GDD, Feature Spec, 최초 구현 run이 연결되지 않아 완전한 설계→구현→검증 사례는 아니다. 현재 graph 안의 내장 evidence와 최신 standalone evidence 상태도 일치하지 않는다.

- 추천 diagram: DRC의 확인된 연결은 실선, 빠진 GDD/Feature Spec/agent run은 점선으로 표시
- 추천 screenshot / evidence: seed 3개 결과 표와 5장 visual evidence contact sheet
- 상세 링크 후보: `plugins/ainvil/harness/scenarios/dungeon_recovery_procedural_recovery_job_e2e.json`, `plugins/ainvil/validation/evidence/EVID-dungeon-recovery-procedural-recovery-job-e2e-latest.json`

## Current Limits

| 현재 상태 | 왜 중요한가 | 다음 기술 과제 |
| --- | --- | --- |
| Graph 연결과 evidence 동기화가 불완전함 | 같은 항목의 상태가 graph와 최신 evidence에서 달라질 수 있음 | revision-aware invalidation과 단일 갱신 경로 |
| GDD→Technical Design 자동 ingestion이 없음 | 설계 의미와 graph 연결을 사람이 관리해야 함 | 문서 parser, 변경 감지, 승인형 import |
| 일반 coding loop가 host AI에 의존함 | AInvil 자체가 구현 작업을 시작·완료하지 않음 | provider 독립 orchestration과 agent run provenance |
| 범용 화면·오디오·성능 검증이 부족함 | compile/runtime 수치만으로 플레이 결과를 승인할 수 없음 | Game View capture, audio probe, profiler adapter |
| Unity 호출 경계가 넓음 | 로컬 환경에서도 의도하지 않은 public method 호출 위험이 있음 | validation allowlist와 기본 제한 강화 |

- 추천 diagram: Limit → Risk → Next Work의 3열 roadmap
- 추천 screenshot / evidence: graph/evidence 불일치 한 사례와 최신 harness failure
- 상세 링크 후보: `plugins/ainvil/reports/traceability_view.json`, `plugins/ainvil/harness/reports/latest-live-harness-report.json`

## Applied Projects

### Dungeon Recovery Company

AInvil harness와 graph에 직접 연결된 검증 사례다. 프로젝트별 hook을 사용한 Play Mode evidence가 있으나 설계 문서부터 최초 구현까지의 전체 provenance는 아직 끊겨 있다.

### Action Required

**Tooling + Workflow Application.** 개발자 확인에 따라 Action Required는 AInvil plugin/runtime과 Unity MCP를 실제 제작 과정에 사용한 프로젝트다. Game Design→Requirement Analysis→Function Mapping→Implementation→Unity Execution→Validation 구조와 실제 코드·증거를 함께 소개하되, 사용 버전·호출 횟수·전체 코드 생성 비율·당시 PSG 구성을 추정하지 않는다.

- 추천 diagram: DRC는 Tooling/Evidence, Action Required는 Methodology로 구분한 적용 수준 표
- 추천 screenshot / evidence: Action Required traceability matrix와 validation report 일부
- 상세 링크 후보: `Portfolio/ACTION_REQUIRED_PORTFOLIO_DRAFT.md`
