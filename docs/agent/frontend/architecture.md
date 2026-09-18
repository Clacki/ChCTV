# Frontend Architecture

## 문서 경계

이 문서는 현재 코드의 디렉터리 책임과 Discovery API 데이터 경계를 설명한다. Discovery의 화면 동작은 [Discovery](../features/discovery.md), 멀티뷰의 viewer·layout 불변식은 [Multiview](../features/multiview.md), 기술 선택의 이유는 [기술 결정](../../DECISIONS.md)에 둔다.

## 현재 구조

| 위치 | 책임 |
| --- | --- |
| `src/app/` | App Router 페이지(`/`, `/multiview`, `/playground`)와 API 진입점(`/api/chzzk/participant-broadcasts`) |
| `src/features/discovery/` | 방송 응답 adapter, 브라우저 polling, 검색·필터, 선택 workspace |
| `src/features/multiview/` | 선택 목록·저장 묶음, URL, slot, viewer, 16:9 layout |
| `src/server/chzzk/` | 서버 전용 CHZZK Open API client, LIVE/channel cache, Redis rising history |
| `src/components/ui/` | 재사용 근거가 있는 UI primitive |
| `src/components/streams/` | 방송 카드·오프라인 참가자·CHZZK 바로가기 presentation |
| `src/lib/` | participant/catalog 처리, refresh schedule, rising 계산, analytics와 공통 helper |
| `src/data/` | 참가자 catalog와 channel override, 개발용 mock data |
| `src/types/` | API 내부 모델과 화면 모델 타입 |
| `tests/`, `e2e/` | Vitest 단위 테스트와 핵심 Playwright 흐름 |

## Discovery 데이터 경계

```text
Browser useParticipantBroadcasts
  -> GET /api/chzzk/participant-broadcasts
  -> getCachedParticipantBroadcasts
  -> LIVE snapshot cache
  -> CHZZK /lives + participant merge
  -> optional /channels metadata + Redis rising history
  -> response-time participant catalog rejoin
  -> Discovery adapter/UI
```

`src/server/chzzk/`만 CHZZK credential과 Upstash 환경 변수를 읽는다. 브라우저는 이미 계산된 `ParticipantBroadcast` 응답만 받고 viewer history를 읽거나 rising을 재계산하지 않는다.

### LIVE, metadata, catalog

- `/lives`는 현재 LIVE/OFFLINE, 시청자 수, 방송 정보를 만든다. PRE_OPEN/OPEN에는 5분, CLOSED/DAY_OFF에는 15분 정책을 사용한다.
- LIVE snapshot cache와 `/channels` 프로필 이미지 metadata cache는 분리한다. channel metadata cache는 6시간이며, 이미지 조회 실패는 LIVE 응답을 실패시키지 않는다.
- cached LIVE snapshot의 participant를 그대로 응답하지 않는다. 응답 직전에 최신 `src/data/participants.json`을 `channelId`로 다시 연결해 groups, affiliation, RP 이름 등 catalog 변경이 LIVE TTL에 묶이지 않게 한다.
- API route는 Node runtime이며 cache 결과가 없고 upstream도 실패하면 503을 반환한다. stale snapshot은 refresh 실패 시에만 사용한다.

### polling

`useParticipantBroadcasts`는 schedule helper와 같은 정책으로 다음 요청을 예약한다.

- PRE_OPEN/OPEN: 5분
- CLOSED/DAY_OFF: 15분
- hidden 탭에서는 timer를 중단한다.
- 다시 visible이 되면 즉시 한 번 refresh하고 새 interval을 잡는다.

개발 React Strict Mode에서는 최초 effect가 두 번 실행되어 요청이 중복되어 보일 수 있다. production 동작 기준은 mount당 하나의 요청·timer이며, 로컬 필터/선택/정렬은 API 요청을 만들지 않는다.

## UI와 상태

Discovery의 검색·필터·RP 표시 설정은 컴포넌트 상태이고 RP 표시 설정만 localStorage에 저장한다. 선택 목록은 React state로 유지하며 최대 6개, 중복 방지, dnd-kit 추가·재정렬을 적용한다. 멀티뷰 채널은 반복 `channel` query parameter로 복원하고, 저장 묶음은 localStorage에 보관한다.

## 테스트 경계

단위 테스트는 cache/schedule/rising, participant merge·adapter, URL·slot·layout 계산을 다룬다. E2E는 Discovery 선택과 멀티뷰 URL, iframe identity, 제거, 16:9 geometry를 검증한다. iframe geometry 테스트는 CHZZK를 mock하며 실제 외부 iframe 동작을 시험하는 테스트가 아니다.
