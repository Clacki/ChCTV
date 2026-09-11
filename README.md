# ChCTV

ChCTV는 치지직의 대규모 합방/RP 콘텐츠를 더 쉽게 탐색하고, 여러 방송을 함께 볼 수 있도록 준비 중인 비공식 웹 서비스입니다. 현재는 MVP의 기반과 배포 가능한 랜딩 페이지 단계이며, CHZZK API·멀티뷰·로그인 기능은 아직 포함하지 않습니다.

## 시작하기

Node.js 22 이상과 pnpm이 필요합니다.

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 명령어

```bash
pnpm dev        # 개발 서버
pnpm lint       # ESLint 검사
pnpm typecheck  # TypeScript 검사
pnpm test       # Vitest smoke test
pnpm test:e2e   # Playwright smoke E2E
pnpm build      # 프로덕션 빌드
```

## 환경 변수

`.env.example`을 `.env.local`로 복사해 설정합니다. PostHog 키가 비어 있으면 Analytics는 자동으로 비활성화되므로 로컬 개발 서버가 정상 실행됩니다.

| 변수 | 용도 |
| --- | --- |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog 프로젝트 키 |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog 수집 엔드포인트 |

CHZZK Client ID, Secret, Token은 향후 반드시 서버 전용 환경 변수로만 관리합니다. `NEXT_PUBLIC_` 환경 변수에는 credential을 넣지 않습니다.

## Vercel 배포

GitHub 저장소를 Vercel 프로젝트에 연결한 뒤 위의 PostHog 환경 변수를 Vercel Project Settings에 추가하면 됩니다. 키 없이도 `pnpm build`와 배포는 가능하며, 이 경우 PostHog 수집만 비활성화됩니다. Vercel Analytics와 Speed Insights는 앱에 이미 포함되어 있어 Vercel 배포 후 자동으로 데이터를 수집합니다.
