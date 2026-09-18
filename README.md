# ChCTV

ChCTV는 여러 CHZZK 방송을 함께 시청하기 위한 **비공식 데스크톱 웹 멀티뷰 서비스**입니다. 방송 탐색부터 선택, 멀티뷰 시청까지의 흐름을 빠르게 제공하는 것을 목표로 합니다.

ChCTV는 NAVER Corp. 또는 CHZZK가 제공·운영·승인하는 공식 서비스가 아닌 비공식 서드파티 프로젝트입니다.

## 현재 기능

### Discovery와 선택

- 공식 CHZZK LIVE API 기반의 현재 방송 Discovery
- 스트리머명, RP명, 별칭 검색
- 참가자 그룹과 봉누도 소속 필터
- 카드의 category와 참가자 그룹·소속 chip 표시
- 시청자 변화 기반의 `시선 집중` 필터 및 정렬 (선택적 Upstash Redis history)
- 1~6개 방송 선택, 중복 방지, 선택 순서 변경
- 선택 묶음 저장·불러오기·삭제 (브라우저 localStorage)

### Multiview

- 반복 `channel` query parameter 기반 멀티뷰 URL 및 새로고침 복원
- 2채널 좌우 / 위아래 1:1 레이아웃
- 3~6채널 가로형 / 세로형 / 균등형 레이아웃
- Main / Sub 교체
- 개별 frame 제거와 마지막 frame 제거 후 공통 Empty State
- CHZZK LIVE iframe 시청과 Main Chat iframe
- 채팅 패널 열기 / 닫기와 360px 안전 폭 유지
- 16:9 슬롯, viewport fit, 중앙 정렬, 1280×720 virtual iframe viewport

## 기술 스택

- Next.js 16, React 19, TypeScript
- Tailwind CSS 4
- dnd-kit
- Lucide React
- PostHog, Vercel Analytics, Vercel Speed Insights
- Vitest, Playwright
- pnpm

## 로컬 실행

Node.js와 Corepack이 필요합니다.

```bash
corepack enable
corepack pnpm install
```

프로젝트 루트에서 `.env.example`을 참고해 `.env.local`을 만들고 필요한 환경 변수를 설정합니다.

```bash
corepack pnpm dev
```

개발 서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.

### 스크립트

```bash
corepack pnpm dev
corepack pnpm build
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm test:e2e
corepack pnpm chzzk:enrich
corepack pnpm chzzk:diagnose
```

## 환경 변수

실제 값은 저장소에 커밋하지 않습니다. `.env.example`의 빈 값을 로컬 또는 배포 환경에서 설정합니다.

| 변수 | 용도 | 공개 여부 |
| --- | --- | --- |
| `CHZZK_CLIENT_ID` | 공식 CHZZK LIVE API Client ID | 서버 전용 |
| `CHZZK_CLIENT_SECRET` | 공식 CHZZK LIVE API Client Secret | 서버 전용 |
| `UPSTASH_REDIS_REST_URL` | 선택적 시선 집중 history Redis endpoint | 서버 전용 |
| `UPSTASH_REDIS_REST_TOKEN` | 선택적 시선 집중 history Redis token | 서버 전용 |
| `NEXT_PUBLIC_POSTHOG_KEY` | 선택적 PostHog 프로젝트 키 | 클라이언트 공개 값 |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog 수집 호스트 | 클라이언트 공개 값 |

`CHZZK_CLIENT_ID`와 `CHZZK_CLIENT_SECRET`은 브라우저 번들 또는 `NEXT_PUBLIC_` 환경 변수에 넣지 않습니다.

## 현재 지원 범위

- Desktop Web 중심으로 제공됩니다.
- 모바일 최적화는 현재 범위에 포함하지 않습니다.
- 브라우저 확장프로그램 기능은 제공하지 않습니다.

## Disclaimer / Legal

ChCTV는 NAVER Corp. 또는 CHZZK가 제공·운영·승인하는 공식 서비스가 아닌 비공식 서드파티 프로젝트입니다.

CHZZK 및 관련 상표·서비스에 대한 권리는 NAVER Corp.에 있으며, ChCTV에서 표시되는 방송, 이미지, 텍스트 및 기타 콘텐츠에 대한 권리는 각 콘텐츠의 원저작자 및 권리자에게 있습니다.

ChCTV 자체의 코드, 디자인 및 프로젝트 자산에 대한 권리는 [LICENSE.md](LICENSE.md)의 ChCTV 라이선스 정책을 따릅니다.

## License

ChCTV 프로젝트 자체의 코드, 디자인, 자산은 별도 허가 없이는 복제·재배포·상업적 이용할 수 없습니다. 제3자 콘텐츠와 오픈소스 의존성에는 각각의 권리와 라이선스가 적용됩니다. 자세한 내용은 [LICENSE.md](LICENSE.md)를 참고하세요.
