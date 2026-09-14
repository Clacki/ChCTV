# 기술 결정

## Next.js App Router

파일 기반 라우팅과 서버 컴포넌트 기본값으로 MVP 화면을 빠르게 만들고, 이후 서버 전용 CHZZK 연동을 자연스럽게 추가할 수 있다.

## pnpm

빠른 설치와 효율적인 의존성 관리를 제공하며, lockfile 기반으로 로컬과 CI 환경의 일관성을 유지한다.

## shadcn/ui

필요한 UI만 코드로 소유해 제품 요구가 구체화될 때 가볍게 확장할 수 있다.

## 초기 Analytics

출시 초기부터 PostHog를 도입해 실제 사용자 행동을 기반으로 UX를 개선한다. 이벤트 이름과 property 형식은 typed wrapper로 제한하며, custom event에는 development/production 환경을 기록한다. 개인식별정보는 전송하지 않고 익명 distinct ID를 사용한다.

초기 핵심 지표는 전체 방문자 중 멀티뷰를 시작한 사용자의 비율인 Multiview Activation Rate다. Analytics는 구조 자체가 목적이 아니라 실제 데이터로 개선 결정을 내리기 위한 수단으로 유지한다.

## 상태 관리 라이브러리를 아직 추가하지 않는 이유

현재는 공유 클라이언트 상태가 없어 React와 URL 상태만으로 충분하다. 멀티뷰 같은 실제 요구가 생긴 뒤 필요한 범위에서 도입을 결정한다.

## Discovery / Selection 뼈대 레이아웃

홈은 56px Global 영역 아래에 Discovery와 Selection / Context를 나란히 둔다. 탐색하면서 선택 맥락을 함께 확인할 수 있도록 Context는 우측 320px로 제한하고, 나머지 폭은 Discovery에 배분한다. 최대 너비 제한 없이 페이지 여백 24px, 영역 간격 16px을 적용한다. 1440px 화면에서 영역 폭은 1056px / 320px이며, 더 넓은 화면에서는 고정 비율 대신 Discovery만 확장한다.

Context는 320px 폭을 유지한 Multiview Controller로 구성한다. Global Header와 페이지 여백 아래에서 sticky로 유지하고, Header·현재 선택·실행 Action·저장·저장 묶음 순으로 배치한다. Discovery와 Controller는 페이지 작업 영역의 단일 선택 배열을 공유하므로 `+ 추가`, 카드 드롭, 개별 해제, 초기화가 같은 최대 6개·중복 방지 규칙을 적용한다. Discovery 카드는 Controller 선택 영역으로 드래그할 수 있고, 선택 항목은 `@dnd-kit/sortable`으로 세로 축에서만 정렬한다. 현재 선택 목록만 남은 높이를 채워 내부 스크롤되도록 해, 목록이 길어져도 실행 Action을 항상 사용할 수 있게 한다. 저장 묶음의 LIVE 수는 mock stream ID와 현재 mock stream의 `isLive` 값으로 계산한다. 실제 저장에는 장기 식별자인 channelId 기반 모델을 별도로 연결한다.

1024px 미만에서는 뼈대가 겹치지 않도록 두 영역을 DOM 순서대로 쌓는 최소 CSS만 적용한다. 실제 모바일 UI, 접기, Sheet, 개별 기능 컴포넌트와 상호작용은 후속 작업으로 남긴다.

## StreamCard와 Discovery 예시 배치

카드는 16:9 썸네일, 스트리머·RP 한 줄, 한 줄 제목, 카테고리와 태그 순으로 구성한다. 썸네일에는 약한 4코너 CCTV frame marker를 두고, 기본 상태에는 `+ 추가`, 선택 상태에는 `추가됨`을 보여 선택 목록 연결 가능성을 전달한다. 태그는 최대 3개와 추가 개수만 표시하고, 긴 문자열은 말줄임 처리한다. RP 정보나 태그가 없어도 공간을 유지해 실제 카드와 데이터 로딩 스켈레톤의 높이를 맞춘다.

기존 페이지 뼈대 안에 최소 폭 288px의 auto-fill Grid와 16px 간격을 적용한다. 1440px에서는 3열, 1920px에서는 4열로 배치되어 카드가 약 324px / 360px 폭을 갖는다. 선택 상태는 selected prop으로 노란 테두리, Yellow CCTV marker, `추가됨` 표식을 표시하며, 클릭이나 선택 상태 관리는 후속 작업에서 연결한다.

StreamCardData는 참가자 메타데이터와 분리한 독립적인 UI 모델이다. 예시 8개의 방송 정보는 가상 데이터이며 RP 원본 JSON이나 실제 방송 API와 결합하지 않는다. 참가자 필터 메타데이터는 affiliations, groups, tags, aliases, channelId로 보존하고 카드에는 필요한 정보만 노출한다.

이미지 상태만 카드 내부의 로컬 상태로 관리한다. 로딩 중에는 썸네일만 스켈레톤으로 표시하고, 실패하거나 URL이 없으면 같은 비율의 정적 안내로 바꾼다. next/image의 onLoad / onError를 사용하며, 예시 이미지 서비스가 640×360 크기로 제공하므로 unoptimized로 원본을 직접 표시한다. 데이터 요청용 StreamCardSkeleton은 별도로 제공하며 API 오류나 빈 목록을 대신하지 않는다.

## StreamCard 정보 밀도 조정

Streamer와 RP 이름은 32px 채널 아바타 옆의 한 줄 Channel Block으로 묶고, 그 아래에 한 줄 방송 제목과 한 줄 `카테고리 · 태그` 메타데이터를 둔다. Category는 태그보다 앞선 짧은 보조 텍스트로 유지한다. 본문 그룹 간 간격은 4px로 조정해 정보는 모두 남기면서 카드 높이를 줄였다.

예시 UI 데이터에는 channelImageUrl을 추가했다. 아바타 로딩 중이나 실패 시에는 스트리머 첫 글자를 표시하므로 깨진 이미지가 보이지 않는다. 선택 상태는 Yellow Border와 의미를 가진 체크 아이콘으로만 표시하며, 실제 담기 동작은 연결하지 않는다.

## 공통 UI Primitive와 Playground

반복 사용 근거가 있는 Button, Chip, Tag, Badge, Avatar, Skeleton만 `components/ui`에 둔다. Chip은 필터 선택을 위한 button, Tag는 방송 메타데이터, Badge는 상태·역할 표시로 역할을 구분한다. Button은 primary, secondary, outline, ghost와 32/40/48px 크기를 제공한다. Badge는 live, accent, neutral을 제공하며 LIVE는 red, 선택 상태는 Cheese Yellow를 사용한다.

Avatar는 정상 이미지와 이미지 없음·실패 상태에서 이름 첫 글자를 표시한다. Skeleton은 일반 Layout Primitive이며 StreamCardSkeleton이 이를 조합한다. `/playground`는 공통 UI의 Variant와 상태를 확인하는 개발용 페이지이고 Product Navigation에는 넣지 않는다.

## Discovery 검색과 Flat Faceted Filter

Discovery의 검색은 스트리머명, RP명, 별칭을 공백·대소문자 정규화한 부분 일치로 처리한다. 필터는 `소속`, `그룹`, `태그`의 독립된 Dropdown Facet으로 단순화하고 옵션은 참가자 데이터의 `affiliations[].name`, `groups`, `tags`에서 파생한다. 현재 확인된 값이 없는 그룹과 태그 Trigger는 숨기며, affiliation type·role·시민 상태는 데이터에만 보존하고 UI에는 노출하지 않는다.

같은 Facet의 선택 값은 OR, 서로 다른 Facet은 AND로 적용한다. 현재 StreamCard 예시는 정확한 스트리머명으로 일치하는 참가자 메타데이터에만 연결하며, 소스에 없는 소속·그룹·태그를 추정하지 않는다.
