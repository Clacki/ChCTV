# Multiview

## 진입과 URL

선택한 채널은 새 창의 `/multiview?channel=<id>&channel=<id>`로 열린다. 반복 `channel` parameter의 순서가 초기 Main/Sub 순서이며, URL 검증 단계에서 빈 값·중복·초과 채널을 제거하고 최대 6개만 사용한다. 직접 진입에 유효한 channel이 없거나 마지막 frame을 제거하면 같은 공통 Empty State로 돌아간다.

## Workspace

- 1~6개의 CHZZK LIVE iframe과 Main Chat iframe을 표시한다.
- Main/Sub 교체, Focus Right/Focus Bottom/Balanced layout, Main Chat 열기·닫기를 지원한다. 2채널은 Balanced control을 표시하지 않는다.
- viewer geometry는 컨테이너 크기와 layout weight에서 계산해 모든 slot을 16:9로 유지하고 중앙 배치한다. CHZZK viewer iframe은 1280×720 virtual viewport를 slot에 맞춰 scale한다.
- 각 frame은 개별 제거할 수 있다. 제거한 channel만 unmount하고 남은 채널은 slot 순서로 압축한다. URL도 `replaceState`로 현재 채널 목록에 맞춘다.

## iframe identity

iframe DOM 순서는 최초 URL의 channel 순서로 고정한다. Main/Sub 교체는 slot mapping과 각 article의 `gridArea`, Crown, viewer profile만 바꾸며, iframe DOM node를 재정렬하지 않는다. 이 구조는 DOM reorder로 발생할 수 있는 재생·볼륨·채팅 상태 초기화와 iframe reload를 피한다.

`e2e/home.spec.ts`는 layout 전환과 Main 교체 뒤 iframe node identity·load count를 별도로 확인한다. 16:9 geometry 테스트에서는 CHZZK iframe을 mock하고 slot geometry만 검증한다.
