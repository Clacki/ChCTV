# 기술 결정

이 문서는 현재도 유효한 trade-off만 기록한다. 구현 경로와 화면 동작은 [agent 문서](agent/README.md)를 우선한다.

## Next.js App Router와 서버 경계

App Router를 사용하고 CHZZK credential, Open API 호출, Upstash Redis 접근은 `src/server/chzzk/`에 둔다. 브라우저에는 정규화된 participant broadcast 응답만 보낸다. credential이나 Redis URL/token을 클라이언트·문서·커밋에 노출하지 않는다.

## LIVE snapshot과 channel metadata cache 분리

현재 LIVE 정보는 5분 또는 15분 schedule로 갱신하지만 channel profile image는 6시간이면 충분하다. 따라서 `/lives` 기반 broadcast snapshot과 `/channels` metadata cache를 분리한다. 선택적 avatar 갱신 실패가 LIVE Discovery를 실패시키지 않는 것이 우선이다.

## participant metadata는 응답 시점에 재연결

LIVE snapshot을 cache하되 groups, affiliation, RP 이름처럼 catalog에서 바뀔 수 있는 participant metadata를 snapshot에 고정하지 않는다. 응답 직전에 최신 catalog를 `channelId`로 rejoin해 catalog 변경이 LIVE cache TTL만큼 늦게 반영되는 문제를 피한다.

## Redis 공용 rising history

시선 집중은 CHZZK fresh LIVE의 viewerCount를 Upstash Redis에 최근 세 snapshot으로 저장해 서버에서 계산한다. 이 방식은 브라우저별 history와 클라이언트 재계산을 없애고 첫 응답에도 공유된 준비 상태를 제공한다. Redis 실패는 Discovery 전체가 아닌 rising 기능만 degrade한다.

## iframe DOM identity 유지

멀티뷰 Main/Sub 교체와 layout 변경에서 iframe을 DOM reorder하지 않고 고정된 channel key와 CSS grid area를 사용한다. iframe reload와 재생·볼륨·채팅 상태의 손실보다 단순한 DOM 순서가 덜 중요하다.

## 대규모 LIVE 목록은 우선 render 최적화

200 LIVE fixture 측정에서 병목은 DOM mutation보다 render/prop churn이었다. `StreamCard`와 draggable wrapper memoization, stable props로 상호작용 비용을 낮췄고, 현재 측정값만으로 virtualization의 복잡성을 도입하지 않는다. 실제 규모나 측정 결과가 변할 때 같은 조건으로 재평가한다.

## 상태 관리

현재 선택·필터 같은 화면 상태는 React state로 충분하다. 멀티뷰 채널 목록은 URL, 저장 묶음과 RP 이름 표시 설정은 localStorage에 보관한다. 별도 전역 상태 라이브러리는 구체적인 공유 상태 요구가 생길 때 검토한다.

## Analytics

PostHog custom event는 `src/lib/analytics/events.ts`의 typed wrapper로만 보낸다. 개인식별정보를 보내지 않고, 핵심 지표는 Multiview Activation Rate다.
