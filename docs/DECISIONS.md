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

Context 하단에는 높이 96px의 Action 공간만 예약한다. Discovery 내부와 Global / Context의 세부 기능 위치는 확정하지 않는다. 정적 서버 페이지의 시맨틱 마크업과 기존 Tailwind 스타일로 표현하며, Foundation 색상은 기존 CSS 토큰에 반영한다. 폰트는 Pretendard 우선 스택을 사용하고, 폰트 파일 로딩은 이번 단계에 추가하지 않는다.

1024px 미만에서는 뼈대가 겹치지 않도록 두 영역을 DOM 순서대로 쌓는 최소 CSS만 적용한다. 실제 모바일 UI, 접기, Sheet, 개별 기능 컴포넌트와 상호작용은 후속 작업으로 남긴다.
