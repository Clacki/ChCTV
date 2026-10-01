# ChCTV Helper

ChCTV `/multiview`에서 CHZZK LIVE iframe 재생과 초기 시청 상태를 지원하는 Manifest V3 보조 확장 프로그램입니다. 확장 프로그램의 popup, 옵션 페이지, action UI는 없으며 ChCTV 멀티뷰에서만 백그라운드로 동작합니다.

## 동작 구조

```text
ChCTV /multiview (허용 origin)
  -> content bridge / handshake
  -> ChCTV tab 전용 session DNR rule
  -> CHZZK LIVE subframe navigation
  -> exact frameId inline initializer
  -> muted, 넓은 화면, 채팅 접기
```

`webNavigation.onCompleted`는 정확한 `https://chzzk.naver.com/live/{32자리 channelId}` subframe만 대상으로 합니다. top frame과 `/chat` iframe에는 시청 초기화를 적용하지 않습니다.

## 허용 origin 및 host 범위

- 개발: `http://localhost`, `http://127.0.0.1`
- 운영: `https://chctv.vercel.app`
- CHZZK: `https://chzzk.naver.com/live/*`

Vercel preview origin이나 `*.vercel.app` wildcard는 허용하지 않습니다.

## 권한

- `declarativeNetRequest`: 허용된 ChCTV tab에서 시작한 CHZZK LIVE/채팅 subframe 응답의 CSP를 필요한 범위에서만 처리합니다.
- `scripting`: 탐지된 CHZZK LIVE subframe의 정확한 `frameId`에만 시청 초기화 함수를 주입합니다.
- `webNavigation`: 관리 중인 ChCTV tab 안의 CHZZK LIVE subframe navigation을 식별합니다.
- `http://localhost/*`, `http://127.0.0.1/*`, `https://chctv.vercel.app/*`: ChCTV content bridge와 handshake를 실행하는 범위입니다.
- `https://chzzk.naver.com/live/*`: DNR과 정확한 CHZZK LIVE frame 초기화에 필요한 범위입니다.

`tabs`, `windows`, `system.display`, `<all_urls>` 권한은 사용하지 않습니다.

## 로컬 설치 및 확인

1. Chrome에서 `chrome://extensions`를 엽니다.
2. Developer mode를 켭니다.
3. **Load unpacked**를 선택하고 이 `extension/` 디렉터리를 고릅니다.
4. `http://localhost:3000/multiview` 또는 `https://chctv.vercel.app/multiview`에서 서로 다른 LIVE 방송을 선택합니다.
5. iframe 재생, 최초 음소거, 넓은 화면, 채팅 접기를 확인합니다.

새로고침, Main/Sub 전환, frame 추가/제거, 채널 변경 뒤에도 새 LIVE document에 초기화가 적용되어야 합니다. Helper가 설치되지 않았거나 응답하지 않으면 ChCTV는 handshake timeout 뒤 안내 UI만 표시하며 페이지 자체는 유지합니다.

## 아이콘

`icons/`의 16, 32, 48, 128px PNG는 `public/favicon.png`을 변경 없이 축소한 자산입니다. manifest와 Chrome Web Store listing에 같은 브랜드 아이콘을 사용합니다.

## 배포 패키지

Store 업로드용 ZIP은 확장 프로그램 실행에 필요한 파일만 포함해야 합니다. PowerShell에서 저장소 루트 기준 아래 명령을 실행하면 `extension/dist/chctv-helper-0.1.0.zip`을 만듭니다.

```powershell
New-Item -ItemType Directory -Force extension/dist | Out-Null
Compress-Archive -Path extension/manifest.json, extension/icons, extension/rules, extension/src -DestinationPath extension/dist/chctv-helper-0.1.0.zip -Force
```

ZIP을 열었을 때 최상위에 `manifest.json`이 있고, `icons/`, `rules/`, `src/`만 포함되어야 합니다. `node_modules`, 테스트, 로그, 저장소 문서, cache는 포함하지 않습니다.

버전을 변경할 때는 `manifest.json`의 `version`, ZIP 파일명, `store/STORE_LISTING.md`의 검토 항목을 함께 갱신합니다.

## Store 제출 자료

- 제출 문구와 권한/개인정보 답변: [`store/STORE_LISTING.md`](store/STORE_LISTING.md)
- 공개 개인정보 문서 원본: [`PRIVACY.md`](PRIVACY.md)

공개 Privacy Policy URL은 `https://chctv.vercel.app/privacy/chctv-helper`입니다. Chrome Web Store URL과 실제 스크린샷은 아직 준비되지 않았습니다.

## 데이터와 개인정보

이 확장 프로그램은 사용자 개인정보, 시청 기록, 채팅 내용, CHZZK 로그인 정보 또는 쿠키를 수집·저장·전송하지 않습니다. `chrome.storage`, `localStorage`, analytics, telemetry, 외부 서버 전송을 사용하지 않습니다.

동작 중에는 DNR lifecycle과 정확한 subframe 식별을 위해 현재 브라우저 세션의 ChCTV tab ID와 CHZZK LIVE URL을 메모리에서만 처리합니다. 해당 값은 저장하거나 외부로 전송하지 않습니다.

## 유지보수 지점

CHZZK UI나 정책이 변경되면 다음을 확인합니다.

- `rules/chctv-live-iframe.json`: LIVE/채팅 iframe CSP 처리 범위
- `src/background/index.js`: session rule lifecycle, exact LIVE URL 검사, inline initializer의 aria-label 및 view mode 상태 확인
- `manifest.json`: 권한, host 범위, 아이콘 참조

ChCTV와 ChCTV Helper는 NAVER Corp. 또는 CHZZK가 제공·운영·승인하는 공식 서비스가 아닌 비공식 서드파티 프로젝트입니다.
