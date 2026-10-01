# Chrome Web Store 제출 자료 — ChCTV Helper

이 문서는 Chrome Web Store Dashboard에 입력할 현재 제출 자료입니다. 모든 설명은 `extension/manifest.json`, `rules/chctv-live-iframe.json`, `src/background/index.js`, `src/content/index.js`의 실제 동작을 기준으로 작성했습니다.

## 기본 정보

| 항목 | 값 |
| --- | --- |
| Name | ChCTV Helper |
| Version | 0.1.0 |
| Short description | ChCTV 멀티뷰에서 CHZZK 라이브 방송 재생을 지원하는 보조 확장 프로그램 |
| Website URL | https://chctv.vercel.app |
| Support URL | https://github.com/Clacki/ChCTV/issues |
| Privacy Policy URL | https://chctv.vercel.app/privacy/chctv-helper |
| Chrome Web Store URL | TODO — 최초 제출 후 발급 |

## 상세 설명

ChCTV Helper는 ChCTV 멀티뷰에서 CHZZK 라이브 방송을 시청할 수 있도록 돕는 비공식 보조 확장 프로그램입니다.

이 확장 프로그램은 ChCTV 멀티뷰가 열린 탭에서만 동작합니다. CHZZK LIVE iframe 요청에 필요한 제한적 처리를 적용하고, 해당 iframe이 준비되면 최초 시청 상태로 음소거, 넓은 화면, 채팅 접기를 설정합니다. 일반 CHZZK 탭, CHZZK VOD·검색·메인 화면, 다른 사이트에는 적용하지 않습니다.

사용 방법:

1. ChCTV Helper를 설치합니다.
2. https://chctv.vercel.app 에 접속합니다.
3. ChCTV에서 멀티뷰를 사용합니다.

확장 프로그램의 popup이나 별도 설정 페이지를 열 필요가 없습니다.

ChCTV와 ChCTV Helper는 NAVER Corp. 또는 CHZZK가 제공·운영·승인하는 공식 서비스가 아닌 비공식 서드파티 프로젝트입니다.

## 권한 정당성

| 권한 | 실제 사용 | 필요한 이유 | 더 좁은 대체 수단 |
| --- | --- | --- | --- |
| `declarativeNetRequest` | 허용된 ChCTV tab에서 시작한 CHZZK `/live/*` subframe 응답의 CSP 처리 | ChCTV 멀티뷰 안의 CHZZK LIVE/채팅 iframe 재생을 지원 | 응답 헤더 처리는 이 권한이 필요하며, `sub_frame`, 허용 initiator, CHZZK LIVE 경로 및 ChCTV tab 전용 session rule로 범위를 제한함 |
| `scripting` | `webNavigation`으로 확인된 정확한 CHZZK LIVE subframe `frameId`에 inline initializer 실행 | 최초 음소거·넓은 화면·채팅 접기를 해당 iframe에만 적용 | content script를 CHZZK 전체에 상시 등록하지 않고 정확한 frame에만 주입함 |
| `webNavigation` | 관리 중인 ChCTV tab 안의 CHZZK LIVE subframe navigation 확인 | top frame, `/chat`, 일반 CHZZK 탭을 제외하고 정확한 LIVE document만 초기화 | URL만으로 모든 CHZZK 탭에 적용하지 않기 위해 필요함 |

### Host permissions 정당성

| Host 범위 | 실제 사용과 제한 |
| --- | --- |
| `http://localhost/*` | 개발 환경 ChCTV bridge 및 handshake 전용 |
| `http://127.0.0.1/*` | 개발 환경 ChCTV bridge 및 handshake 전용 |
| `https://chctv.vercel.app/*` | 운영 ChCTV bridge 및 handshake 전용 |
| `https://chzzk.naver.com/live/*` | CHZZK LIVE subframe DNR 및 정확한 frame 초기화 전용 |

`<all_urls>`, `tabs`, `windows`, `system.display` 권한은 요청하거나 사용하지 않습니다. Vercel preview domain이나 `*.vercel.app` wildcard도 허용하지 않습니다.

## Data usage / Privacy 답변

현재 코드 기준 답변입니다.

- 사용자 개인정보를 수집하지 않습니다.
- 시청 기록을 저장하지 않습니다.
- 채팅 내용을 읽거나 수집하지 않습니다.
- CHZZK 로그인 정보, 쿠키, 인증 토큰에 접근하지 않습니다.
- analytics 또는 telemetry를 사용하지 않습니다.
- 사용자 데이터를 외부 서버로 전송하지 않습니다.
- `chrome.storage`와 `localStorage`를 사용하지 않습니다.
- session DNR rule lifecycle과 exact iframe 식별을 위해 현재 브라우저 세션의 tab ID와 LIVE URL을 메모리에서만 처리하며, 저장·전송하지 않습니다.

## 아이콘

Store icon은 `public/favicon.png` 원본을 변경 없이 축소한 `extension/icons/icon-128.png`을 사용합니다. manifest에는 16, 32, 48, 128px PNG를 연결했습니다.

## 스크린샷 준비 목록

실제 스크린샷은 아직 준비되지 않았습니다. 제출 전 아래 화면을 직접 캡처합니다.

1. ChCTV 멀티뷰 전체 화면
2. 2~4개 방송이 정상 재생되는 화면
3. Main/Sub 또는 멀티뷰 사용성을 보여주는 화면

Dashboard 입력과 촬영 전 최종 확인은 [`SUBMISSION_CHECKLIST.md`](SUBMISSION_CHECKLIST.md)를 사용합니다.

## 업로드 전 확인

- [ ] `extension/dist/chctv-helper-0.1.0.zip`의 최상위에 `manifest.json`이 있는지 확인
- [ ] ZIP에 `icons/`, `rules/`, `src/`만 포함되는지 확인
- [ ] manifest version과 ZIP 파일명이 일치하는지 확인
- [ ] https://chctv.vercel.app/privacy/chctv-helper 공개 route와 Privacy Policy URL을 확인
- [ ] 실제 스크린샷을 업로드
- [ ] Chrome Web Store Dashboard의 현재 정책과 항목을 재확인
