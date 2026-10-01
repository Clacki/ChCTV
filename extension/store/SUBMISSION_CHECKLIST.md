# Chrome Web Store 제출 체크리스트 — ChCTV Helper 0.1.0

이 문서는 Dashboard 자동 조작이나 실제 제출을 대신하지 않습니다. 현재 Dashboard에 보이는 입력 항목과 정책을 사용자가 직접 확인하면서 아래 자료를 복사·입력하기 위한 체크리스트입니다.

## 업로드 패키지

- ZIP: `extension/dist/chctv-helper-0.1.0.zip`
- manifest version: `0.1.0`
- ZIP 최상위: `manifest.json`
- 포함: `icons/`, `rules/`, `src/`
- 제외: README, PRIVACY.md, STORE_LISTING.md, tests, node_modules, `.git`, 로그, cache, 이전 ZIP

## Listing 입력 자료

### Name

```text
ChCTV Helper
```

### Short description

```text
ChCTV 멀티뷰에서 CHZZK 라이브 방송 재생을 지원하는 보조 확장 프로그램
```

### Detailed description

```text
ChCTV Helper는 ChCTV 멀티뷰에서 CHZZK 라이브 방송을 시청할 수 있도록 돕는 비공식 보조 확장 프로그램입니다.

이 확장 프로그램은 ChCTV 멀티뷰가 열린 탭에서만 동작합니다. CHZZK LIVE iframe 요청에 필요한 제한적 처리를 적용하고, 해당 iframe이 준비되면 최초 시청 상태로 음소거, 넓은 화면, 채팅 접기를 설정합니다. 일반 CHZZK 탭, CHZZK VOD·검색·메인 화면, 다른 사이트에는 적용하지 않습니다.

사용 방법:
1. ChCTV Helper를 설치합니다.
2. https://chctv.vercel.app 에 접속합니다.
3. ChCTV에서 멀티뷰를 사용합니다.

확장 프로그램의 popup이나 별도 설정 페이지를 열 필요가 없습니다.

ChCTV와 ChCTV Helper는 NAVER Corp. 또는 CHZZK가 제공·운영·승인하는 공식 서비스가 아닌 비공식 서드파티 프로젝트입니다.
```

### URL

| 항목 | 값 |
| --- | --- |
| Website | https://chctv.vercel.app |
| Privacy Policy | https://chctv.vercel.app/privacy/chctv-helper |
| Support | https://github.com/Clacki/ChCTV/issues |
| Chrome Web Store item | 최초 제출 후 발급됨 — 입력하지 않음 |

### Category

Dashboard에 현재 표시되는 category 목록에서 확장 프로그램의 단일 목적(ChCTV 멀티뷰의 CHZZK LIVE 재생 지원)에 가장 가까운 항목을 사용자가 직접 선택합니다. Dashboard UI나 category 명칭을 추측해 고정하지 않습니다.

## 권한 및 Data usage 답변

### Permission justification

- `declarativeNetRequest`: 허용된 ChCTV 멀티뷰 탭에서 로드되는 CHZZK LIVE/채팅 subframe 재생을 지원하기 위해, 제한된 request scope에서 response header를 처리합니다. 모든 사이트나 일반 CHZZK 탭에는 적용하지 않습니다.
- `scripting`: `webNavigation`으로 확인된 정확한 CHZZK LIVE subframe `frameId`에만 최초 음소거, 넓은 화면, 채팅 접기 초기화를 실행합니다.
- `webNavigation`: 관리 중인 ChCTV 탭 안의 정확한 CHZZK LIVE subframe navigation을 식별합니다. top frame과 `/chat` iframe, 일반 CHZZK 탭을 제외합니다.

### Host permission justification

- `http://localhost/*`, `http://127.0.0.1/*`: 개발 환경 ChCTV bridge 및 handshake
- `https://chctv.vercel.app/*`: 운영 ChCTV bridge 및 handshake
- `https://chzzk.naver.com/live/*`: CHZZK LIVE subframe DNR 및 정확한 frame 초기화

`<all_urls>`, `tabs`, `windows`, `system.display`, preview wildcard는 사용하지 않습니다.

### Data usage

- 사용자 개인정보, 시청 기록, 채팅 내용을 수집하거나 저장하지 않음
- CHZZK 로그인 정보, 쿠키, 인증 토큰에 접근하지 않음
- analytics 또는 telemetry를 사용하지 않음
- 사용자 데이터를 외부 서버로 전송하지 않음
- `chrome.storage`, `localStorage`를 사용하지 않음
- session DNR lifecycle과 exact iframe 식별을 위한 ChCTV tab ID 및 CHZZK LIVE URL은 현재 브라우저 세션의 메모리에서만 처리하며 저장·전송하지 않음

## 실제 제출 전 사용자 확인

- [ ] 이 변경을 production에 배포하고 `https://chctv.vercel.app/privacy/chctv-helper`가 HTTP 200으로 열리는지 확인
- [ ] 개발자 계정 정보와 Dashboard 요구 항목을 직접 입력
- [ ] `extension/icons/icon-128.png`을 Store icon으로 업로드
- [ ] Dashboard가 요구하는 추가 listing 이미지를 직접 준비
- [ ] 실제 Chrome에서 unpacked ZIP과 동일한 extension 소스로 최종 동작 확인
- [ ] Dashboard의 현재 privacy/data-use 질문과 정책을 다시 확인
- [ ] 최종 제출 버튼은 사용자가 직접 실행

## 스크린샷 촬영 가이드

1. ChCTV 멀티뷰 전체 UI가 보이는 실제 화면
2. 2~4개 방송이 동시에 정상 재생되는 실제 화면
3. Main/Sub 또는 멀티뷰 사용성을 보여주는 실제 화면

방송 화면에는 개인 정보, 민감한 브라우저 UI, 로그인 정보가 보이지 않는지 촬영 전에 확인합니다. Helper 미설치 안내 이미지는 우선 제출 이미지에서 제외합니다.

## 실제 Chrome 최종 확인

- [ ] `https://chctv.vercel.app/multiview`에서 Helper READY
- [ ] 1채널, 2채널, 4채널(가능하면 6채널) 재생
- [ ] 새로고침
- [ ] Main/Sub 전환
- [ ] frame 제거 및 추가
- [ ] 최초 muted, 넓은 화면, 채팅 접기
- [ ] 일반 CHZZK 탭 비영향
