# Geummongnyeon Apartments / Action Required — 개발 기록 Story Draft

> 작성일: 2026-09-05  
> 용도: 최종 포트폴리오를 쓰기 전, 대표 사례를 개발 당시의 판단과 확인 순서로 정리한 초안  
> 주의: 웹페이지 문안, 자기소개, 홍보 문구가 아니다.

## 이 초안에서 사용한 기록

프로젝트 루트의 `PORTFOLIO_ANALYSIS.md`, 그 문서가 가리키는 코드·Feature Spec·Validation Evidence, 2026-09-05에 별도로 전달된 개발자 보충 기록을 읽었다. 보충 기록은 다음 사항을 개발자의 설명으로 확인한다.

- 최종 게임이 복수 CCTV 이상현상을 요구해 단일 이상현상 구조를 바꿨다.
- 시작된 Sound는 다른 CAM에서 잠시 멈출 수 있지만, 돌아왔을 때 같은 playhead에서 이어져야 한다.
- Pause의 `Time.timeScale = 0.5`는 고정값 복원을 잡기 위해 의도적으로 넣은 시험값이다.
- Intercom runtime TTS는 배포 환경의 음성 부재 가능성과 결과 재현 문제 때문에 pre-baked WAV로 바꿨다.
- 최종 Intercom 음원 수량은 한국어 45개, 영어 45개, 합계 90개다.

개발자 보충 기록과 저장소 validation 문서가 충돌하면 두 기록을 합쳐 쓰지 않고 각각의 출처와 상태를 밝힌다.

아래의 “Codex에게 다시 맡긴 일”은 과거 프롬프트 인용이 아니다. 현재 코드와 요구·검증 문서에서 확인되는 작업 범위를 짧게 다시 쓴 것이다.

---

## 사례 1. 이상현상을 한 번에 하나만 다루던 규칙을 바꾼 기록

### 원했던 플레이

경비실에서 여섯 CCTV 채널을 번갈아 본다.

이상현상은 발견했다고 바로 사라지지 않는다. 플레이어가 채널과 유형을 맞춰 신고할 때까지 남아 있어야 한다. 그 사이 다른 채널에서도 새 이상현상이 생길 수 있다.

여기서 “이상현상이 세 개 있다”는 말은 화면을 세 번 봤다는 뜻이 아니다. 서로 다른 세 개의 사건이 동시에 남아 있다는 뜻이다. 같은 CAM을 다시 열었다고 사건 수가 늘어나면 안 된다.

게임오버도 두 종류로 나눴다.

- 서로 다른 이상현상 세 개 이상을 5 real minutes 동안 방치한 경우
- `Stranger_Danger`가 표시된 CCTV를 10 continuous seconds 동안 보고 있는 경우

첫 번째는 업무가 밀린 결과다. 두 번째는 특정 위험 콘텐츠를 너무 오래 본 결과다. 같은 타이머로 처리할 규칙이 아니었다.

### 이전 규칙에서 남은 흔적

`Demo_Technical_Design.md:41`과 `Anomaly_Content_Feature_Spec.md`에는 이전 구조가 `single-active`와 `re-observation escalation`이었다고 남아 있다.

그 구조에서는 “현재 이상현상” 하나를 중심으로 상태를 읽을 수 있었다. 그러나 여러 CAM에 사건이 동시에 남는 규칙에서는 현재 채널을 다시 보는 행위와 새 사건 생성이 섞이면 안 됐다.

저장소에는 이전 플레이 화면이나 Git diff가 없다. 실제 플레이 중 어떤 장면에서 이 한계를 처음 발견했는지는 확인할 수 없다.

다만 2026-08-30 최신 규칙은 명확하다.

- active anomaly는 고유한 `instanceId`를 가진다.
- 한 CAM에는 active anomaly를 하나만 둔다.
- CAM 방문은 `phase`와 `observed`만 바꾼다.
- active count는 고유 인스턴스의 수다.
- count가 3 미만이면 overlap timer는 즉시 0으로 돌아간다.

이 기준을 만족하지 않는다면 화면에 이상현상이 보이더라도 원하는 게임 규칙이 아니었다.

### 다시 정한 조건

Codex에 맡길 수 있도록 숫자와 사건의 경계를 먼저 고정했다.

1. 근무 시작 `00:00`부터 `00:35`까지는 이상현상 생성 금지.
2. `00:36`부터 첫 생성 가능.
3. 여섯 CAM 중 이미 사건이 있는 CAM은 다음 spawn 후보에서 제외.
4. `Object`, `Space`, `Stranger`, `Screen`, `Sound`는 신고 유형이며 variant와 분리.
5. `Stranger_Danger` 여부는 파일명이 아니라 catalog의 `dangerClass`로 판정.
6. 3개 이상인 시간이 300초에 도달할 때 overlap GameOver.
7. 그 전에 하나라도 신고돼 2개가 되면 누적 시간을 폐기.
8. 위험 주시는 Monitor mode, 선택 CAM 일치, 실제 dangerous image 표시라는 세 조건을 모두 만족할 때만 계산.
9. CAM 변경, Monitor 종료, 이상현상 제거는 위험 주시 시간을 0으로 되돌림.
10. 8~18초 간격의 minor horror noise는 이상현상으로 세지 않음.

`AnomalyScheduler`가 사건의 수명과 overlap을 맡고, `CctvController`가 현재 화면에 실제로 무엇이 표시되는지와 위험 주시를 맡도록 작업 범위를 나눴다.

### Codex에게 맡긴 일

Codex에는 다음 종류의 작업을 맡겼다.

- 단일 active 상태를 `List<ActiveAnomaly>` 기반으로 바꾸는 코드 수정
- 인스턴스마다 channel, type, variant, danger, phase, 관찰 시각을 보관하는 구조 작성
- 빈 CAM만 고르는 spawn 로직과 중복 생성 거절
- overlap timer와 dangerous gaze timer를 서로 다른 owner에 배치
- 신고할 때 `(channel, type)`을 대조하고 해당 인스턴스만 제거
- 게임오버 순간 남아 있는 모든 미신고 인스턴스를 snapshot으로 남기는 처리
- 원하는 상태를 기다리지 않고 만들 수 있는 Debug Hook 추가
- 요구 ID와 검증 결과를 Feature Spec, Traceability Matrix, Validation Report에 동기화

코드 작성자가 누구인지 줄 단위로 분리할 수는 없다. 저장소에서 확인되는 것은 `AnomalyScheduler`, `CctvController`, `GuardRoomDebugHooks`에 위 작업 결과가 존재한다는 점이다.

### Unity에서 만든 재현 조건

개발 콘솔은 다음 형식으로 원하는 CAM과 유형을 직접 만든다.

```text
anomaly cam1 object
anomaly cam2 space
anomaly cam3 sound 1
anomaly cam4 stranger danger
```

`GuardRoomDebugHooks.ExecuteEditorCommand`는 `cam1`부터 `cam6`, 다섯 유형, variant 번호 또는 `danger`를 해석한다. 이미 사건이 있는 CAM에 다시 spawn하면 성공시키지 않고 “이미 이상현상이 있거나 콘텐츠가 없다”는 결과를 반환한다.

시간 경계는 기다리는 대신 다음 hook으로 직접 설정했다.

- `SetOverlapElapsedSeconds(float)`
- `EvaluateOverlap()`
- `SetDangerousGazeElapsed(float)`
- `EvaluateDangerousGaze(float)`
- `SetShiftMinute(int)`

검증 기록에는 다음 결과가 남아 있다.

- 두 개의 고유 인스턴스를 만든 뒤 CAM을 반복 방문해도 active count는 2로 유지.
- 세 개 이상을 유지한 pre-limit에서는 생존, limit에서 GameOver.
- 세 개에서 두 개로 줄어들면 overlap timer가 0으로 reset.
- `00:35`까지 spawn 없음, `00:36`부터 eligible.
- CAM N을 보는 중 그 CAM의 anomaly가 생성되면 즉시 `Phase=Seen`.
- Monitor를 닫고 다시 열지 않아도 올바른 신고 결과는 `Accepted`.
- GameOver snapshot은 8/8 runtime check 통과.

마지막 항목에서는 인스턴스를 CAM 순서와 다르게 만들었다. 결과 화면에는 `101동 현관 – 물체`, `2층 비상계단 – 공간`, `분리수거장 – 음향`이 CAM 순서로 모두 남았다. GameOver 뒤 runtime anomaly를 지워도 이미 캡처한 목록은 변하지 않았다.

### 그 다음 판단

복수 사건의 identity와 overlap 규칙은 현재 구조로 유지했다.

위험 주시 10초와 reset은 코드와 deterministic inspection으로 확인했다. 그러나 실제 플레이어가 CAM을 바꾸고 Monitor를 닫는 물리 입력까지 포함한 사용자 검증은 완료로 올리지 않았다.

이 사례를 최종 글로 옮기기 전에 한 가지가 더 필요하다.

개발자 보충 기록에서는 변경 이유를 최종 게임 규칙의 변화로 설명한다. 최종 게임은 여러 CCTV에 서로 다른 사건이 동시에 남아야 했다. 따라서 single-active 구조는 구현 오류라기보다 최종 규칙을 표현할 수 없는 이전 설계가 됐다.

재관찰 escalation까지 함께 폐기한 세부 판단이 난이도 조정이었는지, 사건 identity를 지키기 위한 정리였는지는 현재 기록으로 더 나누지 않는다.

### 현재 기록

- 복수 인스턴스·중복 방지: `Implemented`
- overlap pre-limit/limit/reset: deterministic Unity inspection 기록
- 미신고 목록 snapshot: `Runtime Tested`, 8/8 Pass
- 즉시 관찰·재진입 없는 신고: `Runtime Tested`
- 위험 주시 실제 플레이 감각: `Pending`
- 관련 파일: `Assets/Scripts/Core/AnomalyScheduler.cs`, `Assets/Scripts/Observation/CctvController.cs`, `Assets/Scripts/Debug/GuardRoomDebugHooks.cs`, `Assets/Docs/Anomaly_Content_Feature_Spec.md`

---

## 사례 2. CCTV를 닫았다고 이상현상까지 처음으로 돌아가면 안 됐다

### 실제 플레이에서 본 동작

Screen 이상현상을 재생한 뒤 책을 열거나 CCTV를 닫았다. 다시 CCTV로 돌아오자 화면 효과가 처음부터 시작했다.

Sound 이상현상도 CCTV나 채널을 전환하는 과정에서 처음부터 다시 들리는 현상이 있었다. 현재 접근 가능한 Codex 작업에는 `화면·음향 재시작 현상 확인`이라는 제목이 남아 있다.

화면을 닫는 것은 UI 사건이다. 이상현상이 신고돼 제거되는 것은 게임 규칙의 사건이다. 두 사건을 같은 것으로 취급한 결과는 원한 동작이 아니었다.

이때 실패 기준은 “컴파일 오류가 없다”가 아니었다.

- 이미 진행한 Screen이 0초로 돌아감
- 이미 들은 Sound가 다시 처음부터 재생됨
- 다른 CAM에서 생긴 Sound가 플레이어가 보기도 전에 시작됨
- 현재 CAM에서 생성된 사건이 관찰되지 않은 상태로 남음

이 중 하나라도 발생하면 상태 보존이 끝난 것이 아니었다.

### 진행도를 숫자로 다시 적었다

Screen의 시간을 “CCTV panel이 활성화된 시간”이라고 두지 않았다. 한 anomaly instance가 가진 `ScreenElapsedSeconds`로 두고 다음 비율을 정했다.

```text
첫 표시 전                         0x
해당 CAM을 현재 표시               1x
첫 표시 뒤 다른 CAM·화면에 있음     0.25x
해당 CAM으로 복귀                  누적 위치부터 1x
```

첫 표시 전에는 시간이 아무리 지나도 progress가 0이다. 한 번 본 뒤에는 다른 화면에서도 완전히 멈추지 않고 1/4 속도로 진행한다. 다시 돌아오면 새 effect를 만드는 대신 같은 instance의 누적 시간을 사용한다.

Sound에는 다른 조건을 줬다.

- Room, Notebook, Intercom처럼 Monitor 밖에서 생성되면 바로 시작.
- Monitor에서 해당 CAM을 보고 있을 때 생성돼도 바로 시작.
- Monitor에서 다른 CAM을 보고 있을 때 생성되면 대기.
- 시작 여부와 playhead는 anomaly instance ID에 연결.
- 신고로 그 인스턴스가 사라질 때만 저장한 위치를 제거.

Screen과 Sound를 같은 방식으로 처리하지 않았다. Screen에는 `0x/1x/0.25x`라는 진행 규칙이 있고, Sound에는 “최초로 들려도 되는 시점”이라는 gate가 있다.

### Codex에게 다시 맡긴 일

Codex에는 panel enable/disable에서 재생 객체를 새로 만드는 경로를 찾도록 했다.

그 뒤 다음 범위의 수정과 검사를 맡겼다.

- Screen progress의 owner를 `AnomalyScheduler.ActiveAnomaly`로 이동
- 현재 Monitor mode와 관찰 CAM을 이용해 매 frame `1f` 또는 `.25f`를 누적
- `CctvController`가 표시할 때 같은 `instanceId`와 누적 시간을 VHS effect에 전달
- Sound instance별 main/ghost source playhead dictionary 유지
- 화면에서 잠시 빠질 때 position 저장, 같은 instance가 다시 present될 때 `source.time` 복원
- 다른 CAM에서 생성된 Sound의 first-start gate 확인
- 올바른 신고 뒤에만 `StopAnomaly`와 dictionary cleanup 실행
- UI 전환 전후의 progress, phase, `AudioSource.time`을 읽는 검증

이 설명은 실제 과거 프롬프트가 아니다. 현재 `AnomalyScheduler.cs`, `SoundAnomalyController.cs`, `CctvController.cs`에서 확인되는 수정 단위다.

### Unity에서 확인한 값

Screen 검증은 세 구간으로 나눴다.

1. 아직 CAM을 열지 않은 상태에서 시간을 보냄: elapsed 변화 `0`.
2. 해당 CAM 표시: delta/time 비율 `1.0`.
3. 한 번 본 뒤 다른 CAM이나 화면으로 이동: delta/time 비율 `0.25`.

해당 CAM으로 돌아왔을 때 새 인스턴스나 0초가 아니라 누적 위치에서 이어졌다. 이 기록은 `AC-OBS-017`에 남아 있다.

Sound는 세 생성 위치를 따로 만들었다.

1. 다른 CAM을 보고 있는 Monitor: `Phase=Signal`, 재생하지 않음.
2. affected CAM 선택: `Phase=Seen`, 재생 시작.
3. Room에서 생성: `Phase=Seen`, 즉시 재생.

전환 뒤 저장된 playhead는 `10.29477`이었다. pause/resume 뒤 같은 위치를 사용했고 처음부터 replay하지 않았다는 기록이 `AC-OBS-018`에 남아 있다.

Pause 회귀도 함께 확인했다. 실제 Input System의 Escape 경로로 `AudioListener.pause=true`와 `timeScale=0`을 만든 동안 Time과 Fan/Sound playhead가 움직이지 않았다. Resume 뒤 `timeScale=1`, listener false가 됐고 같은 Fan/Sound 위치에서 이어졌다. Console error는 0이었다.

### 문서의 두 표현을 실제 규칙으로 다시 정리했다

검증 기록을 현재 코드와 다시 비교하니 Sound 문장 하나를 그대로 사용할 수 없었다.

`Anomaly_Content_Feature_Spec.md:76`은 한 번 시작한 Sound가 이후 channel/view 변경에서도 계속된다고 적는다. 같은 문서 86행은 다른 Monitor CAM에서는 Sound를 present하지 않는다고 적는다.

현재 `AnomalyScheduler.GetPresentableSound`는 Monitor가 열려 있으면 선택 CAM과 일치하는 Sound만 반환한다. 반환되는 인스턴스가 없으면 `SoundAnomalyController.RefreshPresentation`은 active Sound를 `PauseAnomaly`하고 playhead를 저장한다.

개발자 보충 기록은 이 두 문장의 의미를 다음과 같이 확정한다.

- 한 번 시작한 Sound라도 다른 Monitor CAM에서는 잠시 들리지 않을 수 있다.
- 이때 anomaly instance와 playhead는 제거하지 않는다.
- affected CAM으로 돌아오면 저장한 playhead에서 이어진다.
- 다른 CAM에서 생성돼 아직 한 번도 들리지 않은 Sound는 first-start gate를 지킨다.

따라서 76행의 “continues”는 모든 CAM에서 계속 audible하다는 뜻으로 사용하지 않는다. 재생 상태가 rewind되지 않고 같은 사건으로 이어진다는 뜻이다. 실제 audible 범위는 86행과 현재 코드처럼 affected CAM 또는 Monitor 밖이다.

### 그 다음 판단

이 사례의 Story Draft에서는 “끊김 없는 audible playback”과 “playhead continuity”를 같은 말로 쓰지 않는다.

최종 규칙은 다른 CAM에서 일시 정지를 허용한다. 채널 전환이 anomaly를 새로 만들거나 playhead를 0으로 되돌리는지만 검사한다. 현재 `GetPresentableSound → PauseAnomaly → ResumeAnomaly` 경로는 이 규칙과 맞는다.

### 현재 기록

- Screen `0x/1x/0.25x`: `Runtime Tested`
- Screen 재진입 continuation: `Runtime Tested`
- Sound first-start gate: `Runtime Tested`
- Sound playhead `10.29477` 보존: `Runtime Tested`
- 다른 Monitor CAM: 일시 정지 허용, 복귀 시 같은 playhead 사용
- subjective audiovisual QA: `Pending`
- 관련 파일: `Assets/Scripts/Core/AnomalyScheduler.cs`, `Assets/Scripts/Audio/SoundAnomalyController.cs`, `Assets/Scripts/Observation/CctvController.cs`, `Assets/Docs/Anomaly_Content_Feature_Spec.md`

---

## 사례 3. Pause를 닫을 때 무조건 `Time.timeScale = 1`로 돌리지 않았다

### 원했던 동작

GuardRoom에는 `Room`, `Monitor`, `Notebook`, `Intercom`이라는 서로 다른 플레이 상태가 있다.

어느 상태에서든 Escape로 Pause를 열 수 있어야 했다. Pause 화면이 열린 동안에는 시간이 멈추고, 마우스가 풀리고, 게임 입력과 재생 중인 오디오가 정지한다.

Resume은 “새 Room 상태를 시작”하는 기능이 아니다. Pause 직전의 상태로 돌아가는 기능이다.

그래서 다음 항목을 Pause가 임의로 다시 정하면 안 됐다.

- 기존 `GameMode`
- Pause 직전 `Time.timeScale`
- Pause 직전 `AudioListener.pause`
- Fan과 Sound anomaly의 playhead
- 현재 열린 Notebook·Monitor·Intercom 상태
- settings dropdown의 입력 우선순위

### 저장소에 남아 있지 않은 부분

Pause 구현 전에 실제로 `timeScale`이 1로 잘못 복원됐는지, Sound가 처음부터 다시 재생됐는지는 현재 기록만으로 확인할 수 없다.

여기서는 확인되지 않은 초기 버그를 만들지 않는다. 대신 검증 때 일부러 기본값이 아닌 `0.5`를 넣은 이유와 결과를 기록한다.

Resume 코드가 무조건 `1f`를 쓰면 Room에서는 정상처럼 보인다. 기본 Room의 time scale이 1이기 때문이다. 같은 코드는 0.5에서만 잘못됐다는 사실이 드러난다.

### Codex에 전달한 조건

Pause는 global state를 잠시 빌렸다가 그대로 돌려주는 owner로 정했다.

- 열기 직전에 `previousTimeScale = Time.timeScale` 저장
- 열기 직전에 `previousAudioListenerPause = AudioListener.pause` 저장
- Pause 중에는 `Time.timeScale = 0`, `AudioListener.pause = true`
- Resume, mode change, cinematic 시작, object destroy 경로에서 저장값 복원
- 중복 Pause와 scene transition을 막는 idempotent guard
- Pause가 허용되는 mode를 네 가지로 제한
- cinematic, Training, Preparation, Blackout, GameOver, Win에서는 거절
- `F`는 기기 닫기, `Escape`는 Pause로 역할 유지
- Pause Settings에서 Escape는 열린 dropdown부터 닫음

Codex에는 `PauseMenuController` 작성·연결, `GuardInputController` pause gating, cursor 정리, settings panel 전환, audio 정지·복원 경로와 검증을 맡겼다.

### Unity에서 누른 순서

검증은 `PauseMenuController.Update`가 실제로 읽는 Input System Escape 상태를 queue해 진행했다.

먼저 Training에서 Escape를 보냈다. Pause는 열리지 않았다.

그 다음 `Room`, `Monitor`, `Notebook`, `Intercom`을 각각 Given 상태로 만들고 Escape를 보냈다.

- 네 mode 모두 Pause open 뒤 `timeScale = 0`.
- `AudioListener.pause = true`.
- cursor는 visible/unlocked.
- underlying `GameMode`는 유지.

Resume에서는 일부러 Intercom의 이전 scale을 `0.5`로 만들었다.

- Room/Monitor/Notebook은 원래 값 `1`로 복원.
- Intercom 시험은 원래 값 `0.5`로 복원.

이 값 때문에 “Resume이면 언제나 1”이라는 구현이 통과할 수 없었다.

오디오는 Fan과 Sound의 sample position을 Pause 전후로 비교했다. Pause 중에는 위치가 변하지 않았고, Resume 뒤 저장 위치에서 계속됐다. 이미 소비한 one-shot을 다시 재생하지 않는 조건도 acceptance에 포함했다.

Settings 안의 Escape는 세 번 나눠 확인했다.

1. 해상도 dropdown이 열려 있을 때 첫 Escape: dropdown만 닫힘.
2. 두 번째 Escape: Settings에서 pause root로 돌아감. `timeScale`은 여전히 0.
3. 세 번째 Escape: gameplay resume. `timeScale`은 원래 값으로 복원.

Main Menu 버튼도 별도 경로로 눌렀다. `Lobby`로 이동한 뒤 scale 1, listener false, visible/unlocked cursor였고 pause owner와 dropdown 잔여 상태가 없었다.

검증이 끝난 뒤 locale, brightness, quality, resolution, refresh-rate PlayerPrefs를 원래 값으로 복구했다. Play Mode를 종료했을 때 GuardRoom scene은 dirty가 아니었고 Console error/warning은 0이었다.

### 실제 화면에서 추가로 발견한 것

같은 validation 묶음에서 해상도 dropdown의 첫 행과 마지막 행이 반쪽씩 잘리는 문제가 있었다.

초기 template/viewport inspection은 이 문제를 잡지 못했다. 사용자가 normalized endpoint에서 실제 목록을 보고 실패로 판단했다.

Codex는 content height `46 px`, item vertical stretch, Y offset `0/0`, popup height `236 px`, spacing 0으로 Lobby와 GuardRoom template을 수정했다. 이 수정은 `Compile Verified + Unity Inspection`까지만 기록됐고 사용자 재검증은 남아 있다.

Pause state 복원과 dropdown 화면 검증을 같은 완료 상태로 묶지 않은 이유다.

### 그 다음 판단

Pause lifecycle은 현재 구현을 유지했다. mode와 global state를 되돌리는 검증은 통과했다.

그러나 모든 해상도에서의 click-through, 물리 키 감각, Windows standalone resolution 적용은 별도 확인으로 남겼다.

개발자 보충 기록에 따르면 `0.5`는 실제 게임의 고정 설정값이 아니다. Resume 코드가 무조건 `1f`를 대입하는지 확인하려고 의도적으로 만든 비기본 시험값이다. playhead도 같은 방식으로 Pause 전후 값을 비교했다.

### 현재 기록

- 네 mode Pause/Resume: `Runtime Tested`
- Input System Escape: runtime path 확인
- Intercom 시험값 `0.5` 복원: Pass
- Fan/Sound 같은 playhead resume: Pass
- dropdown → Settings → root → gameplay 입력 순서: Pass
- dropdown half-row 수정: `Compile Verified + Unity Inspection`, 사용자 재검증 `Pending`
- Windows standalone resolution 적용: `Pending`
- 관련 파일: `Assets/Scripts/UI/PauseMenuController.cs`, `Assets/Docs/Pause_Menu_Dropdown_UX_Feature_Spec.md`, `Assets/Docs/Validation_Report.md:351-372`

---

## 사례 4. 코드는 통과했지만 빨간 외곽선은 화면에 없었다

### 원했던 화면

Room에서 상호작용 가능한 물체를 바라보면 빨간 외곽선이 보여야 했다.

외곽선은 `3 screen pixels`를 기준으로 했다. 오브젝트 내부를 흰색으로 덮지 않는다. 벽 뒤의 물체가 비쳐서도 안 된다. 대상을 바꾸거나 시선을 치우면 기존 renderer의 mask를 정확히 복원해야 한다.

선택 표시 때문에 물리 raycast가 달라지면 안 됐다. Intercom처럼 renderer가 많은 물체에서도 동작해야 했다.

이후 요구는 더 좁아졌다. 창문 전체를 상호작용 대상으로 두던 이전 규칙은 superseded됐고, 최종 revision에서는 창문을 제외하고 Intercom의 개별 조작부를 표시해야 했다.

### 첫 번째로 확인된 실패

Shader Graph Custom Function의 출력은 `Vector4`였지만 HLSL 함수는 `out float3 Out`이었다.

D3D compile 결과는 다음 오류였다.

```text
'SelectionSilhouetteComposite_float': cannot implicitly convert output parameter from 'float3' to 'float4'
```

이 상태에서는 화면 검증으로 넘어갈 이유가 없었다. Codex에 HLSL 출력을 `float4(finalRgb, SceneColor.a)`로 맞추고 graph를 강제 reimport하도록 했다.

수정 뒤 결과는 `ShaderUtil messages=0, errors=0`, Console error 0이었다.

컴파일 문제는 닫혔다. 선택 표시가 보인다는 뜻은 아니었다.

### 상태가 맞아도 화면은 틀릴 수 있었다

Play Mode에서 production center ray를 사용했다. Debug Hook은 Room 상태를 만드는 데만 사용했다.

카메라는 `RightWindowModel` 중심을 향했다.

- 선택 거리: `1.132 m`
- registry: true
- marked renderer: `1 of 1`
- feature: active
- width: `3 px`

다른 검사도 정상처럼 보였다.

- right window에서 151-renderer Intercom으로 selection 변경
- 이전 target mask 정확히 복원
- 시선을 치우면 registry clear
- frame `68587`에도 clear 유지
- highlight 전후 raycast hit 동일: window `default @ 1.253 m`, Intercom `Intercom @ 0.810 m`

그 상태에서 1920×1080 PlayerRig camera capture를 만들었다.

방은 정상적으로 렌더링됐다. 선택 target도 유지됐다. 그러나 빨간 outline과 당시 요구였던 희미한 white overlay는 보이지 않았다.

개발자가 보려던 것은 registry의 bool이 아니었다. 플레이어가 화면에서 구분할 수 있는 외곽선이었다. 첫 capture는 실패로 기록했다.

### Codex에 다시 물은 범위

다음 질문은 “왜 outline 코드가 컴파일되지 않는가”가 아니었다.

“mask가 실제 composite pass의 입력으로 선언돼 있는가?”

기존 `AddBlitPass`는 `_SelectionMask`를 global shader state로만 읽고 있었다. transient mask가 RenderGraph dependency로 명시되지 않았다.

Codex에 다음 수정을 맡겼다.

- utility blit 제거
- custom raster composite pass 작성
- camera color와 mask에 `UseTexture(source)`, `UseTexture(mask)` 선언
- destination render attachment 명시
- exact transient mask handle binding

다시 compile과 shader 검사를 했다. error는 0이었다.

같은 `RightWindowModel @ 1.132 m`, 같은 1920×1080 capture를 반복했다. frame `5223`에서도 target/registry/marked renderer는 `RightWindowModel / true / 1 of 1`이었다.

두 번째 화면에도 outline이 없었다.

RenderGraph dependency 수정은 필요했지만, 그것만으로 화면 결과를 만들지는 못했다.

### 두 번째 실패 뒤 바꾼 질문

간접 경로를 더 줄였다.

- rendering-layer-filtered RendererList가 실제 선택 mesh를 mask에 그리는가?
- `TextureHandle`을 `Material.SetTexture`로 넘기는 방식이 callback 시점에 유효한가?
- Shader Graph Blackboard property가 아닌 HLSL uniform에 실제 값이 들어가는가?
- pass가 queue된 뒤 intermediate attachment 요구를 늦게 설정하고 있지 않은가?

Codex에는 다음 변경을 맡겼다.

- registry에 있는 모든 active `MeshRenderer`/`SkinnedMeshRenderer`의 모든 submesh를 mask pass에서 직접 draw
- active depth attachment 유지
- `RasterGraphContext.cmd.SetGlobalTexture`로 mask bind
- global-state modification 선언
- `requiresIntermediateTexture`를 per-camera `Setup`이 아니라 pass constructor에서 설정
- `LastRenderStatus`, record/composite frame, mask draw count를 남기는 non-spam diagnostic state 추가
- texel size, width, color를 `SetGlobalVector/Float/Color`로 bind

마지막 static inspection에서는 이전 uniform 값이 0이었다는 원인이 확인됐다. compile, 두 shader inspection, Console check는 모두 error/message 0이었다.

### 그 다음 판단

여기서 완료라고 쓰지 않았다.

마지막 uniform·draw 수정 뒤 새 Play Mode capture를 실행하지 않았기 때문이다. 현재 문서가 주장할 수 있는 최고 상태는 `Compile Verified + Unity Inspection`이다.

최종 화면 acceptance에는 아직 다음이 남아 있다.

- 실제 Game View에서 빨간 outline이 보이는가
- 내부 tint가 0인가
- near/far와 scale 변화에서 약 3 px를 유지하는가
- hard corner가 끊기지 않는가
- 내부 mesh 경계선이 생기지 않는가
- 가려진 물체가 비치지 않는가
- 개별 Intercom control에서 표시되는가
- transparent target, MSAA, dynamic resolution, camera stacking, Windows standalone에서 어떤가

개발자 보충 기록은 이 작업의 채택 기준을 화면에 선이 보이는지로 다시 확인한다. Registry, renderer selection, raycast, compile 결과가 정상이어도 1920×1080 capture에 빨간 선이 없으면 실패로 기록했다. RenderGraph dependency 수정 뒤에도 같은 기준을 적용했다.

이후 production R8 mask를 직접 읽는 MaskOnly 진단과 Final 화면 재검증이 추가됐다. Monitor / Intercom / clear 분기는 raw white/black 및 최종 outline capture로 PASS했고, 전체 AC-PROP-005는 잔여 조건 때문에 `Partially Covered / Pending`으로 둔다.

### 현재 기록

- HLSL `float3 → float4`: `Compile Verified`
- registry/mask 복원/raycast 유지: runtime state Pass
- 첫 1920×1080 capture: `Fail (Visual)`
- 명시적 RenderGraph dependency 뒤 두 번째 capture: `Fail (Visual)`
- 직접 renderer/submesh draw와 global uniform 수정: `Compile Verified + Unity Inspection`
- 최신 화면 결과: tested branches `PASS`; Full AC-PROP-005 `Partially Covered / Pending`
- 관련 파일: `Assets/Scripts/Rendering/SelectionSilhouetteRendererFeature.cs`, `Assets/Scripts/Rendering/SelectionHighlightRegistry.cs`, `Assets/Resources/Shaders/SelectionSilhouetteComposite.hlsl`, `Assets/Docs/Validation_Report.md:175-198`

---

## 사례 5. Intercom 코드가 동작한 뒤 음성 구조를 바꾸면서 이전 검증을 폐기한 기록

### 원했던 통화

Intercom은 대사를 재생하는 버튼 UI가 아니었다.

같은 버튼도 통화 종류와 현재 단계에 따라 의미가 달라진다.

- 일반 주민 통화: `Respond → Replay → Answer → End`
- 정상 방문자 Stranger 04: `Respond → Replay → Verify → Open → End`
- 위험 방문자 Danger 01: `Respond → End → Entrance/Stranger 신고`

전화가 울린 뒤 15 real seconds 안에 Respond하지 않으면 실패한다. 연결 뒤 잘못된 기능 버튼을 누르면 마지막 상대 대사를 반복하고 warning과 Mistake를 올린다. 두 번째 warning은 `FailureAlert`로 간다. 순서가 아닌 End는 한 번에 실패한다.

Danger 01은 문을 열면 GameOver다. 통화를 끝낸 다음 CCTV 신고로 마무리해야 한다.

### Codex에 맡긴 단위

통화 규칙과 대사 자산을 한 파일에 넣지 않았다.

Codex에는 다음 종류의 작업을 맡겼다.

- `Idle`, `Ringing`, `Connected`, `AwaitingReport`, `FailureAlert` state와 timeout 작성
- 현재 conversation, selected variant, step, warning, last caller line, pending visitor를 보관하는 controller 작성
- conversation과 step을 JSON data로 분리
- Intercom의 물리 버튼 입력을 현재 state의 허용 action과 대조
- visitor anomaly와 Entrance CCTV, 신고 결과를 통화 state에 연결
- red ringing light, green connected light, alarm/reception/error/alert sound 연결
- 한국어·영어 subtitle과 caller voice 경로 연결
- 특정 conversation과 variant를 바로 시작하는 debug command 추가
- core flow와 음성 revision의 validation evidence를 별도로 기록

개발 콘솔에서는 먼저 목록을 확인하고 특정 통화를 고정할 수 있다.

```text
intercom list
intercom normal_noise 1
intercom <conversation-id> random
```

`GuardRoomDebugHooks`는 통화 중이면 새 요청을 성공으로 보고하지 않는다. ID나 variant가 없거나 현재 통화를 먼저 끝내야 하면 시작 실패를 반환한다.

### 2026-08-30에 확인한 상태 흐름

core flow 검증은 다음 순서로 남아 있다.

- `normal_noise`: Respond → Replay → Answer → End, warning 0, Mistake 증가 없음, Idle 복귀.
- 잘못된 action 한 번: 직전 caller line 반복, warning 1.
- 잘못된 action 두 번: warning 2, `FailureAlert`.
- Stranger 04: spawn 뒤 5초 후 call, Respond → Replay → Verify → Open → End, Idle 복귀, visitor anomaly clear.
- Stranger 04를 받기 전 Entrance/Stranger 신고: visitor/call clear, Mistake +5.
- Danger 01을 받기 전 신고: authored GameOver branch.
- Danger 01 안전 경로: Respond → End에서 `AwaitingReport`, Entrance/Stranger 신고 뒤 Idle, visitor clear.
- Connected 상태: green emission on, red ringing과 red buzzer off.
- 최종 Console: 새 error/warning 0.

`Intercom_Validation_Evidence.md`는 이 core flow를 2026-08-30 `User Confirmed`로 기록한다.

### 동작한 증거를 그대로 재사용하지 않은 이유

당시 caller voice는 runtime Windows TTS를 사용했다. 실제 한국어 caller line과 음성이 맞는지 확인한 기록도 있다.

그 뒤 음성 구조를 바꿨다. 개발자 보충 기록에는 이유가 남아 있다. 배포되는 Windows 환경에 같은 TTS voice가 없을 수 있었고, 실행 환경마다 같은 음성 결과를 보장하기 어려웠다.

- runtime SAPI 호출 제거
- 한국어는 Microsoft Heami Desktop, 영어는 Microsoft Zira Desktop으로 offline bake
- normal event는 Female/Male/Old 세 variant
- abnormal/dangerous event는 StrangeCaller/StrangeCaller2 두 variant
- 한 번 고른 variant가 voice profile, unit, caller label, caller wording, WAV path를 함께 결정
- pitch/filter/distortion/noise의 고정 처리를 WAV에 bake
- runtime에서는 같은 고정 처리를 다시 적용하지 않음

이 revision 뒤에는 “예전 TTS가 재생됐다”는 검증으로 현재 WAV routing을 통과 처리할 수 없었다.

그래서 `Intercom_Validation_Evidence.md:3`은 이전 Caller TTS 행을 현재 구현 증거로 사용하지 말라고 명시한다. core state flow의 증거는 남기고, 바뀐 audio path만 다시 미검증 상태로 내렸다.

### 최종 수량과 과거 검증 기록을 분리했다

현재 `Assets/Resources/Intercom/Voice`에는 WAV 90개가 있다.

- 한국어 45개
- 영어 45개

`Intercom_Feature_Spec.md:38`과 `Unity_Traceability_Matrix.md`도 90개, 언어별 45개를 현재 구조로 적는다.

그러나 `Validation_Report.md:396-400`에는 2026-09-02 영어 bake가 48개를 생성하고 import했다고 적혀 있다. 같은 기록은 한국어도 48개였다고 전제한다.

개발자 보충 기록은 최종 수량을 한국어 45개, 영어 45개로 확정한다. 현재 파일과 Feature Spec도 이 수량과 맞는다. 48개는 최종 수량으로 사용하지 않는다.

Git history가 없으므로 세 파일이 중간 bake에서 제거된 것인지, 당시 report 숫자가 잘못된 것인지는 확인할 수 없다. 최종 문서에서는 “현재 90개”와 “과거 48개 생성 기록”을 하나의 검증 수치로 합치지 않는다.

### 그 다음 판단

Intercom story에서는 두 revision을 분리한다.

- 2026-08-30 core FSM과 입력 순서: 사용자 확인 기록 있음.
- 2026-09-01 이후 pre-baked randomized voice: 구현과 offline asset 확인이 있고, 개발자 보충 기록은 새 revision에 맞춰 voice routing을 다시 확인했다고 적는다.

저장소의 기존 `Intercom_Validation_Evidence.md`는 이 revision을 “not validated by user request”로 남긴 상태다. 반면 최신 개발자 기록은 routing을 다시 확인했다고 말한다. 검증 절차와 결과 값이 validation 문서에 아직 동기화되지 않았으므로, 이 초안에서는 `Developer Confirmed / evidence sync pending`으로 구분한다.

최종 검증 기록으로 올리려면 다음 내용을 문서에 보충해야 한다.

- 어떤 conversation ID와 variant로 한국어·영어 routing을 확인했는지
- selected variant의 unit/caller/subtitle/audio path를 어떤 값으로 대조했는지
- subjective listening까지 확인했는지, 경로 연결만 확인했는지
- `Validation_Report.md`의 48개 기록을 historical/superseded로 수정할지

### 현재 기록

- core Intercom FSM과 주요 입력 순서: 2026-08-30 `User Confirmed`
- 일곱 conversation JSON parse: Pass
- normal/abnormal/Stranger 04/Danger 01 state branch: runtime supporting evidence Pass
- 18 caller variant, 현재 WAV 90개: `Implemented`, 파일 직접 확인
- offline Zira bake/import 기록: 존재하나 과거 48개 기록은 최종 수량과 불일치
- 현재 pre-baked locale routing: 개발자 보충 기록상 재확인, 저장소 evidence sync `Pending`
- subjective listening: 확인 범위가 기록되지 않아 `Not Verified`
- 관련 파일: `Assets/Scripts/Core/IntercomController.cs`, `Assets/Scripts/Core/IntercomConversationData.cs`, `Assets/Resources/Intercom/intercom_conversations.json`, `Assets/Resources/Intercom/Voice`, `Assets/Docs/Intercom_Validation_Evidence.md`

---

## 초안을 검토할 때 지킬 구분

개발자 보충 기록을 반영한 뒤에도 각 Story에서는 다음 세 가지를 섞지 않는다.

1. 개발자가 플레이 규칙이나 실패 기준을 먼저 정한 부분
2. Codex가 구현·탐색·반복 수정을 수행한 부분
3. Unity 화면·입력·수치로 채택하거나 보류한 부분

과거 실패 화면은 진단 이력으로 보존한다. 최신 highlight는 tested branches PASS와 Full AC의 Partially Covered / Pending을 함께 기록하며, Intercom routing의 별도 evidence sync 상태도 그대로 구분한다.
