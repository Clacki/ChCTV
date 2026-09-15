# Frontend Architecture

## 현재 구조

| 위치 | 책임 |
| --- | --- |
| `src/app/` | Next.js App Router의 route와 전역 스타일 |
| `src/components/ui/` | 소유하는 공통 UI 컴포넌트 |
| `src/lib/` | 재사용 유틸리티와 analytics 보조 코드 |
| `src/lib/analytics/` | PostHog 초기화와 페이지뷰 수집 |
| `tests/` | Vitest smoke test |
| `e2e/` | Playwright smoke E2E |

## 기술 결정

### Next.js App Router

파일 기반 라우팅과 서버 컴포넌트 기본값을 사용해 MVP 화면을 빠르게 만들고, 향후 서버 전용 CHZZK 연동을 자연스럽게 추가한다.

### pnpm

pnpm과 lockfile로 로컬 및 CI 의존성을 일관되게 관리한다.

### UI 컴포넌트

필요한 Button과 Badge는 코드로 소유한다. 디자인 요구가 구체화될 때 가볍게 확장한다.

### Analytics

Vercel Analytics와 Speed Insights를 사용한다. PostHog는 `NEXT_PUBLIC_POSTHOG_KEY`가 있을 때만 비식별 페이지뷰 수집을 활성화하며, 키가 없으면 비활성화된다.

### State management

Discovery의 선택·필터와 멀티뷰의 UI 상태는 React state를 사용한다. 멀티뷰 채널 목록은 반복 `channel` query parameter로 URL에 보존하며, 저장된 멀티뷰 묶음은 browser localStorage에 저장한다.

## Related references

- 실행 명령과 환경 변수: [README.md](../../../README.md)
- UI/UX 공통 규칙: [design system](../design/design-system.md)
