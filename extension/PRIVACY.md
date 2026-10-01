# ChCTV Helper 개인정보 안내

최종 수정: 2026-10-02

공개 페이지: https://chctv.vercel.app/privacy/chctv-helper

## 목적

ChCTV Helper는 ChCTV 멀티뷰에서 CHZZK LIVE iframe 재생과 초기 시청 상태(최초 음소거, 넓은 화면, 채팅 접기)를 지원하는 비공식 보조 확장 프로그램입니다.

## 수집·저장하지 않는 정보

ChCTV Helper는 다음 정보를 수집하거나 저장하지 않습니다.

- 이름, 이메일, 계정 정보 등 사용자 개인정보
- 시청 기록 또는 선호 채널
- 채팅 내용
- CHZZK 로그인 정보, 쿠키, 인증 토큰
- 위치 정보
- analytics 또는 telemetry 데이터

chrome.storage, localStorage 및 외부 분석 도구를 사용하지 않습니다.

## 동작 중 처리하는 정보

확장 프로그램은 현재 브라우저 세션에서 ChCTV 멀티뷰 tab과 CHZZK LIVE subframe을 구분하기 위해 ChCTV tab ID와 해당 LIVE URL을 메모리에서 일시적으로 처리합니다. 이 값은 session DNR rule lifecycle과 정확한 iframe 초기화에만 사용하며, 저장하거나 외부로 전송하지 않습니다.

## 데이터 전송 및 판매

ChCTV Helper는 사용자 데이터를 외부 서버로 전송하거나 제3자에게 제공·판매하지 않습니다.

## 권한 사용 목적

- `declarativeNetRequest`: 허용된 ChCTV tab에서 시작한 CHZZK LIVE/채팅 subframe에 필요한 범위의 CSP 처리를 적용합니다.
- `scripting`: 확인된 CHZZK LIVE subframe에만 시청 초기화 함수를 실행합니다.
- `webNavigation`: ChCTV tab 안에서 로드된 정확한 CHZZK LIVE subframe을 식별합니다.
- 제한된 host permissions: localhost 개발 환경, `https://chctv.vercel.app`, CHZZK LIVE 경로에서만 bridge, DNR, 초기화를 수행합니다.

## 문의

프로젝트 문의와 버그 제보는 [ChCTV GitHub Issues](https://github.com/Clacki/ChCTV/issues)를 이용해주세요.

ChCTV와 ChCTV Helper는 NAVER Corp. 또는 CHZZK가 제공·운영·승인하는 공식 서비스가 아닌 비공식 서드파티 프로젝트입니다.
