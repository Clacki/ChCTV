<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# ChCTV 프로젝트 규칙

## 작업 문서 안내

작업 전에는 현재 작업에 필요한 문서만 확인한다.
전체 문서 지도는 [docs/agent/README.md](docs/agent/README.md)에서 확인한다.

- 제품 목적·MVP 범위: [product/overview.md](docs/agent/product/overview.md)
- 사용자 흐름·화면 전환: [product/user-flow.md](docs/agent/product/user-flow.md)
- UI/UX·디자인 시스템: [design/design-system.md](docs/agent/design/design-system.md)
- 앱 구조·기술 결정·Analytics: [frontend/architecture.md](docs/agent/frontend/architecture.md)
- 방송 탐색·검색·필터: [features/discovery.md](docs/agent/features/discovery.md)
- 선택 목록·멀티뷰: [features/multiview.md](docs/agent/features/multiview.md)

## 프로젝트 개요와 목표

ChCTV는 CHZZK 시청자를 위한 비공식 서드파티 웹 서비스다. 첫 번째 대상 콘텐츠는 봉누도이며, 방송 중인 참가자 탐색, 직업·조직·그룹 필터, 다중 방송 선택, 멀티뷰 시청과 조합 공유를 빠르게 제공한다.

이 프로젝트는 포트폴리오용 화면이 아니라 실제 사용자의 행동을 바탕으로 개선하는 MVP다. 우선순위는 빠른 출시, 실제 사용자 정보, 행동 데이터 측정, 데이터 기반 UX 개선 순서다.

## 개발 원칙

- 현재 요구사항보다 앞선 추상화, 기능, 의존성을 추가하지 않는다.
- 공식 라이브러리가 적절하면 직접 구현보다 우선 사용한다.
- 서버·클라이언트 경계를 지키고 외부 API 응답은 validation/mapper 뒤의 내부 모델로 변환한다.
- 기능 폴더는 실제 기능이 생길 때만 추가한다. Atomic Design이나 과도한 FSD 구조는 도입하지 않는다.
- 기본 구조는 `src/app`, `components/ui`, `components/common`, `features`, `lib`, `server`, `data`, `types`의 가벼운 feature-oriented 구조다.

## 기술 스택

현재 사용: Next.js App Router, TypeScript strict, pnpm, Tailwind CSS v4, shadcn/ui, Lucide React, PostHog, Vercel Analytics, Vercel Speed Insights, Vitest, Playwright, GitHub Actions, Vercel.

TanStack Query, nuqs, Zod는 실제 기능에 필요할 때 도입한다. Zustand는 현재 사용하지 않는다. 서버 상태는 TanStack Query, 공유 가능한 URL 상태는 nuqs 또는 URL search params, 로컬 UI 상태는 React state를 우선 검토한다.

## CHZZK 연동과 개인정보

- 공식 API뿐 아니라 공개적으로 접근 가능한 CHZZK 웹 API를 서비스에 필요한 범위에서 사용할 수 있다.
- 문서화되지 않은 웹 API는 변경 가능성이 높으므로 서버 전용 adapter/mapper 뒤에서 사용하고, 외부 응답을 프론트엔드에서 직접 사용하지 않는다.
- 과도한 요청을 피하며, 캐시, 호출 주기 제한, 중복 요청 방지를 추가할 수 있는 구조로 설계한다.
- 스트림 URL/m3u8, credential, 인증 토큰 등 보호된 정보의 추출이나 우회 접근, 공식 서비스에 해가 되는 구현은 금지한다.
- Client ID, Secret, Token은 서버 전용으로 관리하고 브라우저 번들에 노출하지 않는다.
- 로그인 기능이 없는 현재 서비스에서는 `posthog.identify()`를 사용하지 않는다.
- PostHog에는 네이버·CHZZK 계정 ID, 이메일, 실명, 인증 정보 등 개인식별정보를 보내지 않는다. 공개 channel_id는 제품 기능 분석에 필요한 경우에만 허용한다.

## Analytics

PostHog의 목적은 단순 방문 집계가 아니라 실제 사용자 행동을 측정해 UX를 개선하는 것이다. 초기 핵심 KPI는 **Multiview Activation Rate**(전체 방문자 중 멀티뷰를 시작한 사용자 비율)다.

- UI 컴포넌트에서 `posthog.capture()`를 직접 호출하지 않고 `src/lib/analytics/events.ts`의 typed `analytics` wrapper를 사용한다.
- 명시적 제품 이벤트는 `channel_selected`, `channel_deselected`, `filter_changed`, `multiview_started`, `multiview_channel_added`, `multiview_channel_removed`, `main_channel_changed`, `multiview_shared`만 사용한다.
- 모든 커스텀 이벤트에는 `event_slug`, `source`, `environment`을 포함한다. 필요할 때만 `channel_id`, `channel_count`, `selected_count`, `filter_type`, `filter_value`를 추가한다.
- `environment`는 `NODE_ENV`를 기준으로 development 또는 production으로 기록하며, 분석은 production 이벤트를 기본 기준으로 한다.
- 일반 클릭은 Autocapture에 맡기며, 모든 UI 상호작용을 커스텀 이벤트로 만들지 않는다.
- `$pageview`는 기존의 수동 수집 방식을 유지한다. 자동 pageview와 수동 pageview를 함께 켜지 않는다.

## UI·테스트·문서

- shadcn/ui를 우선 사용하고 불필요한 범용 UI 컴포넌트를 새로 만들지 않는다.
- dark UI, 핵심 사용자 흐름, 반응형과 접근성을 기본으로 고려한다.
- 우선 테스트 대상은 필터 로직, 멀티뷰 레이아웃 계산, URL 상태 직렬화/복원, 외부 API mapper, 핵심 흐름이다. 숫자만을 위한 테스트는 만들지 않는다.
- 중요한 선택과 trade-off는 `docs/DECISIONS.md`에 간결히 기록한다.

## MVP 범위와 완료 확인

명시적인 요구 변경 전에는 로그인, 회원가입, DB, 결제, 관리자 페이지, AI 기능, 복잡한 애니메이션, 고도화된 상태 관리, 불필요한 디자인 시스템, Funnel/Dashboard/Retention/Cohort/A-B Test/Feature Flag/Session Replay 설정을 추가하지 않는다.

작업 전에는 기존 구현·구조·문서를 확인한다. 작업 후에는 가능한 범위에서 `pnpm lint`, `pnpm typecheck`, 관련 `pnpm test`, `pnpm build`를 실행하고 결과를 보고한다.
