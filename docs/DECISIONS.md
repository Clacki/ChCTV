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
