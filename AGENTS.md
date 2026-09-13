<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# ChCTV Agent Guide

치씨티비는 치지직 방송을 탐색하고 선택해 여러 개를 동시에 시청하는 멀티뷰 서비스다.

## Start here

프로젝트 작업 전에는 현재 작업에 필요한 문서만 확인한다. 전체 문서 지도는 [docs/agent/README.md](docs/agent/README.md)다.

## Read by task

- 제품 목적·MVP 범위: [product/overview.md](docs/agent/product/overview.md)
- 사용자 흐름·화면 전환: [product/user-flow.md](docs/agent/product/user-flow.md)
- UI, UX, layout, component 스타일: [design/design-system.md](docs/agent/design/design-system.md)
- 앱 구조·기술 결정·analytics: [frontend/architecture.md](docs/agent/frontend/architecture.md)
- 방송 탐색·검색·필터: [features/discovery.md](docs/agent/features/discovery.md)
- 선택 목록·멀티뷰 시청·재배치: [features/multiview.md](docs/agent/features/multiview.md)

## Reading rules

1. 현재 작업과 관련된 문서만 읽는다.
2. 공통 규칙은 product, design, frontend 문서를 따른다. Feature 문서는 공통 규칙을 복제하지 않는다.
3. 기존 설계와 충돌할 수 있는 구현 전에는 관련 문서를 확인한다.
4. 구조적 결정이 바뀌면 코드와 관련 문서를 함께 갱신한다.

## Priority

문서가 충돌하면 다음 순서로 따른다.

1. 현재 사용자 요구사항
2. 이 파일의 Next.js 작업 규칙
3. 관련 feature 문서
4. product, frontend, design 공통 문서
5. 기타 프로젝트 문서
