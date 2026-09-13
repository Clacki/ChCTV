# ChCTV Agent Documentation

프로젝트 공통 지식은 이 디렉터리에 둔다. 작업 전에는 [루트 AGENTS.md](../../AGENTS.md)에서 관련 문서를 찾아 필요한 범위만 읽는다.

| 영역 | 문서 | 읽는 작업 |
| --- | --- | --- |
| Product | [overview](product/overview.md), [user flow](product/user-flow.md) | 제품 목적, MVP 범위, 사용자 흐름 |
| Design | [design system](design/design-system.md) | UI/UX, layout, 컴포넌트 스타일 |
| Frontend | [architecture](frontend/architecture.md) | 앱 구조, 기술 결정, analytics |
| Features | [discovery](features/discovery.md), [multiview](features/multiview.md) | 기능별 화면과 동작 |

## Rules

- 공통 규칙은 Product, Design, Frontend 문서에 한 번만 둔다.
- Feature 문서는 공통 규칙을 복사하지 않고 관련 문서를 참조한다.
- 구조적 변경은 코드와 관련 문서를 함께 갱신한다.
- 문서 이력은 파일명 버전이 아닌 Git으로 관리한다.

## GitHub 작업

- 이슈와 PR을 만들 때는 `.github/ISSUE_TEMPLATE/`, `.github/PULL_REQUEST_TEMPLATE.md`의 형식을 사용한다.
- PR 본문은 템플릿의 모든 섹션을 한국어로 작성하고, 관련 이슈가 있으면 `Closes #번호`로 연결한다.
- 코드·문서 변경 범위와 실행한 확인 항목을 PR의 `변경 사항`, `확인`에 기록한다.
