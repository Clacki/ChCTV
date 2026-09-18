# Discovery

## 책임과 화면

Discovery는 `/`에서 현재 방송을 찾고 최대 6개를 선택해 멀티뷰를 여는 기능이다. 데이터 경계와 cache/polling은 [Architecture](../frontend/architecture.md), 공통 UI 규칙은 [Design System](../design/design-system.md)을 따른다.

- LIVE는 기본으로 viewerCount 내림차순으로 표시한다. category는 카드 정보일 뿐 GTA를 포함한 category로 기본 필터링하지 않는다.
- 스트리머명, RP명, 별칭을 공백·대소문자 정규화한 부분 일치로 검색한다.
- 그룹은 같은 facet 안에서 OR, 그룹과 봉누도 소속 facet 사이는 AND다.
- 필터·검색이 있을 때만 조건에 맞는 OFFLINE 참가자도 함께 표시한다.
- 카드에서 추가하거나 선택 영역으로 드래그해 넣고, 선택 영역에서 순서를 바꾸거나 해제한다.

RP 이름 표시는 사용자가 켤 수 있으며 `chctv.discovery.show-rp-name`에 보존한다. 선택 목록과 저장 묶음에는 RP 이름 표시 설정을 전파하지 않는다.

## 현재 방송 응답

`/api/chzzk/participant-broadcasts`는 cached broadcast와 `risingHistoryReady`를 응답한다. `participant-broadcast-adapter.ts`는 이를 LIVE `StreamCardData` 또는 OFFLINE roster row로 변환한다. participant catalog는 응답 시점에 최신 `channelId` 기준으로 재연결되므로 LIVE snapshot 안의 오래된 groups, affiliation, RP 이름을 UI에 고정하지 않는다.

## 시선 집중

시선 집중은 브라우저별 PoC가 아니라 Upstash Redis 공용 history 기반 서버 계산이다.

```text
fresh CHZZK LIVE -> Redis viewerCount snapshot -> server rising 계산
-> ParticipantBroadcast metadata -> LIVE cache/API -> Discovery adapter -> filter/sort/UI
```

- Redis key는 `chctv:rising:snapshots`이며 최근 최대 3개의 LIVE `viewerCount` snapshot을 둔다.
- fresh `/lives` 성공 경로에서만 snapshot을 기록한다. cache hit과 stale fallback은 기록하지 않는다.
- 4분 이내의 가까운 snapshot은 dedupe한다. Redis가 없거나 실패하면 Discovery는 계속 동작하고 rising만 비활성화된다.
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`은 서버 전용이며 실제 값은 문서화하거나 커밋하지 않는다.
- `risingHistoryReady`는 공용 history에 두 snapshot 이상이 있어 계산할 수 있음을 뜻한다. 클라이언트는 history를 받거나 재계산하지 않으므로, 준비된 공용 history가 있으면 새 사용자도 첫 응답부터 같은 rising 상태를 받는다. 추가 CHZZK 호출은 없다.

현재 계산은 최신 두 snapshot의 실제 약 5분 증가를 기준으로 한다. 현재 viewerCount가 100 이상이고, 증가가 양수이며, 증가율이 10% 이상일 때 `isRising`과 `risingIncrease`가 설정된다. `risingRate`는 그 증가율이며, `risingSortValue`는 두 snapshot이면 최근 약 5분 증가, 세 snapshot이면 가장 오래된 snapshot 대비 약 10분 증가다.

시선 집중 필터는 `isRising`과 `risingIncrease > 30`을 모두 만족하는 LIVE만 보이고 `risingSortValue` 내림차순으로 정렬한다. 이때만 카드에 Flame과 증가 인원을 표시한다. history가 아직 준비되지 않았을 때는 준비 안내를 표시한다.

시선 집중은 PRE_OPEN/OPEN에서만 사용할 수 있다. CLOSED/DAY_OFF에서는 같은 위치에 disabled 상태와 `운영시간에 사용할 수 있습니다.` tooltip을 표시한다. 열린 탭이 polling/visible refresh에서 비운영 상태를 확인하면 활성 필터를 자동으로 끄고 일반 LIVE 목록으로 복귀한다. 운영 재개 시에는 다시 enabled되지만 자동으로 켜지지 않는다.

비운영시간에도 일반 Discovery는 기존 15분 polling으로 LIVE/OFFLINE과 viewerCount를 갱신한다. 다만 fresh `/lives`가 성공해도 Redis rising snapshot은 기록하지 않는다. PRE_OPEN/OPEN의 fresh fetch만 기존 dedupe·최대 세 snapshot 규칙으로 기록한다. 비운영시간 뒤 첫 운영 snapshot은 기존 15분 초과 gap reset으로 새 baseline이 되므로, 이전 운영 cycle과 rising을 비교하지 않는다.

## 성능

200 LIVE fixture로 selection, second selection, remote reorder, removal을 각각 5회 측정했다. 최적화 뒤 median은 순서대로 65ms, 75ms, 65ms, 68ms였고, 기준값은 291ms, 219ms, 170ms, 167ms였다. 병목은 DOM mutation보다 React render/prop churn이었다.

현재 `StreamCard`와 draggable wrapper의 memoization, stable callback/props를 사용한다. virtualization은 이 측정과 현재 상호작용 비용에서 도입하지 않았다. 목록 규모나 측정 결과가 바뀌면 동일 조건으로 다시 측정한 뒤 판단한다.
