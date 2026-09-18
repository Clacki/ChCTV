# 치씨티비 디자인 시스템
> 초기 디자인 시스템 · 프론트엔드 구현 및 UI/UX 의사결정 기준
> Version 0.3
## 0. 목적
이 문서는 치씨티비의 화면과 컴포넌트를 설계·구현할 때 사용하는 공통 기준이다.
핵심 목표:
- 반복되는 디자인 값을 토큰으로 관리한다.
- `Discovery → Selection → Viewing` 흐름을 일관되게 유지한다.
- 방송 콘텐츠와 멀티뷰 사용성을 브랜드 표현보다 우선한다.
- CCTV와 치즈 모티프는 사용성을 해치지 않는 범위에서 사용한다.
> **사용성 → 콘텐츠 → 일관성 → 브랜드 → 장식**
---

# 1. Product & Concept
## 1.1 Product
**치씨티비(ChCTV)** 는 치지직 방송을 탐색하고 원하는 방송을 골라 여러 개 동시에 시청하는 멀티뷰 서비스다.
핵심 키워드:
`CCTV` · `Multiview` · `Chzzk` · `Cheese` · `Cute Tech` · `Dark UI`
치지직의 후원 단위인 **치즈**를 브랜드 모티프로 사용하고 CCTV의 Yellow / Black 관제 문법과 결합한다.
> **멀티뷰 UX가 중심이고, CCTV는 시각적 문법이며, 치즈는 브랜드 캐릭터다.**
## 1.2 Core User Flow
1. 방송 탐색
2. 검색 / 필터
3. 방송 선택
4. 선택 목록 및 순서 확인
5. 멀티뷰 시작
6. 시청 중 Main 교체 / layout 변경 / frame 제거
핵심 경험:
- **Discovery** — 방송 탐색
- **Selection** — 멀티뷰 구성
- **Viewing** — 멀티뷰 시청
첫 화면에서 가장 먼저 전달되어야 하는 메시지:
> **“여러 방송을 골라 동시에 보는 서비스”**
CCTV와 치즈는 그 다음 인상이다.
---

# 2. Design Principles
- **Content First** — 방송 콘텐츠가 가장 큰 시각적 비중을 가진다.
- **Discovery Before Viewing** — 좋은 멀티뷰 경험은 좋은 방송 선택 경험에서 시작한다.
- **Multiview First** — 추가·제거·Main 교체·layout 변경을 빠르게 수행할 수 있어야 한다.
- **Functional Before Decorative** — CCTV/치즈 표현이 사용성을 낮추면 제거한다.
- **Dark Monitoring Base** — 탐색과 시청 화면은 Dark UI를 기본으로 한다.
- **Cheese as Accent** — Yellow는 CTA, Selected, Active, Focus에 사용한다.
- **Cute, Not Childish** — 귀여움은 작은 디테일과 마이크로 인터랙션에서 표현한다.
---

# 3. Foundation
## 3.1 Grid & Spacing
기본 그리드: `4px`
우선 값:
`4 / 8 / 12 / 16 / 24 / 32 / 48 / 64`
예외:
- 1px Border
- Typography Line-height
- 외부 미디어 비율
- 아이콘 내부 좌표
| Token | Value | 용도 |
| --- | ---: | --- |
| `space-1` | 4px | 최소 간격 |
| `space-2` | 8px | 작은 기본 간격 |
| `space-3` | 12px | 내부 간격 |
| `space-4` | 16px | 기본 Padding / Gap |
| `space-6` | 24px | 그룹 간격 |
| `space-8` | 32px | 큰 영역 간격 |
| `space-12` | 48px | Section 간격 |
| `space-16` | 64px | Page-level 간격 |
별도 이유가 없는 `5px`, `7px`, `13px` 등의 임의 값은 만들지 않는다.
## 3.2 Radius
| Token | Value | 대상 |
| --- | ---: | --- |
| `radius-xs` | 4px | Badge |
| `radius-sm` | 8px | Button, Input |
| `radius-md` | 12px | Card, Panel |
| `radius-lg` | 16px | Modal, Drawer |
| `radius-xl` | 24px | 브랜드 그래픽 |
| `radius-full` | 9999px | Pill |
일반 Surface는 `12~16px`을 중심으로 사용한다.
---

# 4. Color System
## 4.1 Core Palette
| Token | Value | 역할 |
| --- | --- | --- |
| `color-cheese-primary` | `#FFD84D` | CTA, Selected, Focus |
| `color-cheese-deep` | `#E5A900` | Hover / Pressed, 보조 Accent |
| `color-cctv-black` | `#171717` | App Background |
| `color-surface-black` | `#242424` | Card, Panel, Toolbar |
| `color-warm-white` | `#FFF9E8` | Brand Light Surface |
Primary Cheese 사용:
- 주요 CTA
- 선택된 방송
- 활성 Slot
- Focus
- 핵심 브랜드 Accent
사용하지 않음:
- 전체 Background
- 긴 본문
- 모든 Border
- Warning 상태
Yellow 위 텍스트는 Black 계열을 기본으로 한다.
## 4.2 Neutral & Semantic
| Token | Value |
| --- | --- |
| `color-bg` | `#171717` |
| `color-surface` | `#242424` |
| `color-surface-elevated` | `#303030` |
| `color-border` | `#424242` |
| `color-border-strong` | `#686868` |
| `color-text-primary` | `#F5F5F5` |
| `color-text-secondary` | `#C7C7C7` |
| `color-text-tertiary` | `#929292` |
| `color-text-disabled` | `#666666` |
| Semantic | Value | 의미 |
| --- | --- | --- |
| `success` | `#43C47A` | 정상 / 성공 |
| `warning` | `#FF9F43` | 주의 |
| `error` | `#F05D5E` | 실패 / 위험 |
| `info` | `#5AA7FF` | 정보 |
| `live` | `#FF4D67` | LIVE |
브랜드 Yellow와 Warning, LIVE와 Error는 별도 의미로 관리한다.
## 4.3 Palette Candidates
| Palette | Colors | 특징 |
| --- | --- | --- |
| **A · Warm Cheese** | `#FFD84D` `#E5A900` `#171717` `#242424` `#FFF9E8` | 기본안 |
| **B · Soft Butter** | `#F6D65B` `#C99700` `#1B1B1B` `#353535` `#FFF4CC` | 더 부드러움 |
| **C · Signal Pop** | `#FFE14F` `#FFB800` `#111111` `#2B2B2B` `#FFF7DB` | 더 강한 LIVE 인상 |
현재 기본안은 **Palette A**다.
---

# 5. Typography
기본 Typeface: **Pretendard**
Metadata Typeface: **JetBrains Mono**
JetBrains Mono 사용:
- `CAM 01`
- `CH 01`
- `LIVE`
- `REC`
- Timecode
- Slot Number
Mono Typeface는 전체 UI의 `5~10%` 이하로 제한한다.
| Style | Size / Line-height | Weight |
| --- | --- | ---: |
| Display | 32 / 40px | 700 |
| H1 | 24 / 32px | 600 |
| H2 | 20 / 28px | 600 |
| H3 | 18 / 24px | 600 |
| Body Large | 16 / 24px | 400~500 |
| Body | 14 / 20px | 400~500 |
| Caption | 12 / 16px | 400~500 |
| Metadata | 12 / 16px | 500 |
특별한 이유 없이 11px 이하 텍스트를 사용하지 않는다.
---

# 6. Layout System
핵심 Layout:
1. **Browse Layout**
2. **Multiview Layout**
3. **Standard Layout**
고정 Navigation Sidebar는 기본 구조로 사용하지 않는다.
## 6.1 App Shell
```text
App
├─ Global Header
└─ Page
```
Header: `48~56px`
역할:
- Brand
- 최소 Global Navigation
- User / Settings
- 전역 Action
탐색과 멀티뷰 조작은 각 화면의 Context UI에서 처리한다.
## 6.2 Browse Layout
```text
Browse
├─ Search / Filter
├─ Stream Grid
└─ Selection Panel
```
Desktop 기준:
- Discovery: `75~80%`
- Selection Panel: `20~25%`
- Main Gap: `16px`
- Selection Panel: `300~360px`
- Page Padding: `16~24px`
선택된 방송이 없을 때 Selection Panel은 숨기거나 축소할 수 있다.
하나 이상 선택하면 현재 선택 상태를 계속 보여준다.
## 6.3 Multiview Layout
```text
Multiview
├─ Compact Viewer Toolbar
└─ Multiview Grid
```
권장:
- Workspace Padding: `4~8px`
- Stream Gap: `4~8px`
영상 면적을 일반 Page Padding보다 우선한다.
## 6.4 Standard Layout
설정, 도움말, 단축키 등 일반 페이지.
- Page Padding: `24~32px`
- Content Max-width: `960~1200px`
---

# 7. Discovery UI
## 7.1 Search & Filter
검색 대상은 스트리머명, RP명, 별칭이다. 현재 facet은 그룹과 봉누도 소속이며, category는 카드 정보로만 표시한다. GTA를 포함한 category를 기본 필터로 사용하지 않는다. 세부 동작은 [Discovery](../features/discovery.md)를 따른다.
## 7.2 Stream Grid
- Card 최소 폭: `280~320px`
- Grid Gap: `12~16px`
- Wide: 3~4열
- Desktop: 2~3열
- Tablet: 2열 중심
- Mobile: 1~2열
Column 수는 Viewport와 Selection Panel 노출 여부에 따라 결정한다.
---

# 8. Stream Card
필수 정보:
- Thumbnail
- LIVE
- Viewer Count
- Streamer
- Stream Title
- Category
- Selected State
과도한 Tag와 Metadata는 넣지 않는다.
State:
- **Default** — 낮은 대비 Border
- **Hover** — `color-border-strong`
- **Selected** — Yellow Border + Check 또는 Slot Number
색상만으로 선택 상태를 전달하지 않는다.
선택 방식은 프로젝트 전체에서 하나로 통일한다.
- Card 전체 클릭
- 또는 명확한 `+ 추가` Action
둘을 혼용하지 않는다.
---

# 9. Selection Panel
Selection Panel은 Navigation Sidebar가 아니라 현재 구성 중인 멀티뷰를 편집하는 Context Panel이다.
주요 기능:
- 선택 개수
- 선택된 방송
- 제거
- 순서 변경
- 빈 Slot
- 멀티뷰 시작
```text
MULTIVIEW        3 / 4
01  Stream A
02  Stream B
03  Stream C
04  + 방송 선택
[ 멀티뷰 시작 ]
```
Selection 순서와 실제 Multiview Slot 순서를 연결한다.
```text
01 | 02
---|---
03 | 04
```
순서 변경 시 명확한 Drag Handle을 제공한다.
저장된 멀티뷰, 추천 조합 등은 Secondary Menu로 분리한다.
---

# 10. Multiview
## 10.1 Default Grid
현재 지원 범위는 1~6채널이다. 2채널은 가로/세로 1:1, 3~6채널은 Focus Right, Focus Bottom, Balanced layout을 제공한다. 정확한 CSS grid area와 16:9 geometry는 [Multiview](../features/multiview.md)를 따른다.
## 10.2 Focus Mode
Focus는 별도 페이지가 아니라 Multiview Grid의 layout 상태다. Main slot을 크게 두는 Focus Right 또는 Focus Bottom과 균등 배치를 전환할 수 있다.
## 10.3 Monitoring UI
사용 가능한 CCTV 문법:
- `CAM 01`
- `CH 01`
- `LIVE`
- `REC`
- Timestamp
- Focus Frame
영상 위 HUD는 최소화한다.
Stream View의 기본 정보:
- 방송 제목 / 채널
- LIVE
- Slot / CAM
- 필요한 경우 Viewer Count
- Player Controls
Active 표현 우선순위:
1. Cheese Yellow Border
2. Surface Contrast
3. 약한 Glow
---

# 11. Responsive
| Viewport | 기준 |
| --- | --- |
| Mobile | `< 640px` |
| Tablet | `640~1023px` |
| Desktop | `1024~1439px` |
| Wide | `≥ 1440px` |
Breakpoint는 실제 Layout이 깨지는 지점을 우선한다.
### Wide / Desktop
- Stream Grid + Selection Panel
- Selection Panel 고정 폭
### Tablet / Mobile
현재 MVP는 desktop web 중심이다. 모바일용 Bottom Bar, Bottom Sheet, 우선순위 기반 viewer 재구성은 현재 구현으로 간주하지 않는다.
---

# 12. Component Basics
## 12.1 Size
| Component | Small | Medium | Large |
| --- | ---: | ---: | ---: |
| Button | 32px | 40px | 48px |
| Icon Button | 32px | 40px | 48px |
| Input | — | 40px | 48px |
| Icon | 16px | 20px | 24px |
기본 Button / Input은 `40px`.
Touch Target은 최소 `40px`을 권장한다.
## 12.2 States
모든 Interactive Component는 다음을 고려한다.
`Default` · `Hover` · `Pressed` · `Focus` · `Selected` · `Disabled` · `Loading` · `Error`
Border:
- Default: `color-border`
- Hover: `color-border-strong`
- Selected: `color-cheese-primary`
- Keyboard Focus: Yellow Outer Ring
Selected와 Focus는 구분한다.
## 12.3 Core Components
**Discovery**
- Search Bar
- Filter Chip / Popover
- Sort
- Stream Grid
- Stream Card
- LIVE Badge
**Selection**
- Selection Panel
- Selected Stream Item
- Empty Slot
- Drag Handle
- Multiview Start CTA
**Viewing**
- Multiview Grid
- Stream Player
- Viewer Toolbar
- CAM / Slot Badge
- Focus Control
- Replace Stream Drawer
**Foundation**
- Button / Icon Button
- Input / Select
- Checkbox / Radio / Switch
- Tooltip / Popover / Dropdown
- Modal / Drawer
- Toast
- Empty / Loading / Error State
---

# 13. Brand & Iconography
기능 아이콘:
- Outline 중심
- 일관된 Stroke
- 작은 크기에서도 명확한 실루엣
- 기본 크기 `16 / 20 / 24px`
핵심 브랜드 모티프:
> **CCTV Camera + Cheese**
사용 가능:
- Cheese Yellow
- Cheese Hole
- Cheese Slice
- Cheese Token
- CCTV Cheese Mascot
권장:
- Logo
- Mascot
- Empty / Loading
- Onboarding
- Error Illustration
- Marketing
비권장:
- 모든 Button
- 모든 Card
- 모든 Player
- 전체 Background
- Input
- 일반 Navigation
치즈 구멍은 Signature Graphic으로 사용하되 Pattern처럼 남발하지 않는다.
---

# 14. Elevation, Motion & Accessibility
## Elevation
Dark UI 계층 표현 순서:
1. Background Contrast
2. Border
3. Surface Color
4. Shadow
Shadow는 Modal, Dropdown, Popover, Tooltip 등 Floating UI에 제한한다.
## Motion
| Token | Duration |
| --- | --- |
| `motion-fast` | 100ms |
| `motion-normal` | 150~200ms |
| `motion-slow` | 250~300ms |
영상 시청을 방해하는 반복 Animation은 사용하지 않는다.
`prefers-reduced-motion`을 고려한다.
## Accessibility
- 가능한 범위에서 WCAG 대비 기준을 충족한다.
- Yellow 위 White Text는 기본적으로 사용하지 않는다.
- 색상만으로 상태를 전달하지 않는다.
- Keyboard Focus를 명확하게 제공한다.
- Touch Target은 최소 40px을 권장한다.
- Drag & Drop에는 대체 조작 방법을 고려한다.
---

# 15. Token Summary
| Category | Values |
| --- | --- |
| Grid | `4px` |
| Spacing | `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64` |
| Radius | `4 / 8 / 12 / 16 / 24 / full` |
| Component Height | `32 / 40 / 48` |
| Icon | `16 / 20 / 24` |
| Primary Font | `Pretendard` |
| Metadata Font | `JetBrains Mono` |
| Primary Cheese | `#FFD84D` |
| Deep Cheese | `#E5A900` |
| Background | `#171717` |
| Surface | `#242424` |
| Header | `48~56px` |
| Browse Padding | `16~24px` |
| Stream Grid Gap | `12~16px` |
| Selection Panel | `300~360px` |
| Multiview Padding / Gap | `4~8px` |
---

# 16. Do / Don't
| Do | Don't |
| --- | --- |
| 방송 탐색과 선택 흐름을 우선한다 | Viewer만 기준으로 전체 UI를 설계하지 않는다 |
| 현재 선택 상태를 계속 보여준다 | 선택 상태를 깊은 화면 안에 숨기지 않는다 |
| Dark Surface와 Border로 계층을 만든다 | Shadow를 기본 계층 표현으로 사용하지 않는다 |
| 기존 Grid / Token을 재사용한다 | 이유 없이 새 값을 만든다 |
| Yellow를 CTA / Selected / Focus에 사용한다 | Yellow를 Warning까지 남용하지 않는다 |
| CCTV 문법을 상태와 Slot 표현에 활용한다 | 영상 위 HUD를 과도하게 쌓지 않는다 |
| 치즈를 브랜드 포인트로 사용한다 | 모든 컴포넌트를 치즈 모양으로 만들지 않는다 |
| Selection 순서와 Slot을 연결한다 | 결과 배치를 예측할 수 없게 만들지 않는다 |
| 모바일에서 구조를 재구성한다 | Desktop Layout을 그대로 축소하지 않는다 |
---

# 17. Review Checklist
### Flow
- Discovery / Selection / Viewing 중 어디에 속하는가?
- 사용자의 다음 행동이 명확한가?
- 현재 선택 상태를 확인할 수 있는가?
### UX
- 방송 콘텐츠보다 UI가 더 튀지 않는가?
- 선택·제거·재배치 결과를 예측할 수 있는가?
- 필요한 Action이 쉽게 발견되는가?
### Layout
- 4px Grid를 따르는가?
- 기존 Spacing / Radius로 해결 가능한가?
- 불필요한 Padding이 없는가?
### Brand
- Yellow가 필요한 곳에만 쓰였는가?
- CCTV 요소가 기능을 설명하는가?
- Cheese 요소가 남발되지 않는가?
- 귀엽지만 유치하지 않은가?
### Component
- 기존 Component로 해결할 수 없는가?
- 주요 Interaction State를 고려했는가?
- Keyboard와 Touch에서도 사용할 수 있는가?
---

# Guiding Rule
> **사용성 → 콘텐츠 → 일관성 → 브랜드 → 장식**
치즈 또는 CCTV 표현을 제거했을 때 사용성이 좋아진다면 제거한다.
치씨티비의 브랜드는 장식의 양이 아니라 **반복되는 색상, 구조, 상태 표현, 작은 디테일의 일관성**으로 만든다.
