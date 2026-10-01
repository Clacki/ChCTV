# CHZZK 웹 VOD 수집 PoC

## 범위와 방식

`scripts/chzzk-web-vod-poc.mjs`는 `participants.json`의 남봉, 다주, 멋사 채널만 대상으로 첫 VOD 목록 페이지를 조회하는 독립 PoC다. 기존 VOD collector, Redis snapshot, GitHub Actions, `/vods` 화면에는 연결하지 않는다.

봉누도2의 최종 수집 대상, 운영 기간, 후보 처리와 증분 수집 기준은 [봉누도2 VOD 수집 범위 및 정책](./bongnudo2-vod-collection-policy.md)에서 관리한다.

조사 당시 CHZZK 웹이 사용하는 공개 JSON 응답은 다음 형식이었다.

```text
GET https://api.chzzk.naver.com/service/v1/channels/{channelId}/videos?sortType=LATEST&videoType=&page=1
```

HTML 파싱이나 Playwright는 사용하지 않았다. 목록 응답이 필요한 필드를 직접 제공하므로 그보다 복잡한 수단이 필요하지 않았다. 이는 공식 Open API 문서에 포함된 인터페이스가 아니라 웹 서비스의 내부 응답으로 보이며, 변경 가능하다.

실행은 수동으로만 한다.

```bash
node scripts/chzzk-web-vod-poc.mjs
node scripts/chzzk-web-vod-poc.mjs --verify-thumbnail
node scripts/chzzk-web-vod-poc.mjs --find-gta
node scripts/chzzk-web-vod-poc.mjs --video-no 15390665
```

`--find-gta`는 `videoType === "REPLAY"`와 `videoCategoryValue === "Grand Theft Auto V"`를 함께 확인한다. 채널별 최대 3페이지에서 멈추므로 전체 과거 목록을 수집하지 않는다.

## GTA V 추가 확인

2026-09-27에 남봉과 다주의 각 1~3페이지(각 90개), 멋사의 빈 목록 응답을 확인했다. 180개 비어 있지 않은 항목은 모두 `videoType: REPLAY`였고 `videoCategory`와 `videoCategoryValue`도 모두 존재했지만, `videoCategoryValue: Grand Theft Auto V` 항목은 발견하지 못했다. 이 범위는 전체 24·29페이지보다 작으므로 해당 채널의 전체 목록에 GTA V가 없다는 결론은 낼 수 없다.

### 다주 지정 VOD 단건 확인

목록을 추가로 대량 탐색하지 않고, 다주 채널의 `videoNo` 15390665를 공개 상세 응답 `GET /service/v2/videos/15390665`으로 1회 조회했다. 응답의 `channel.channelId`는 다주의 `bdc57cc4217173f0e89f63fba2f1c6e5`였고, 원본 페이지는 <https://chzzk.naver.com/video/15390665>이다.

| 필드 | 실제 응답값 |
| - | - |
| `videoNo` | `15390665` |
| `videoTitle` | `흑수협 마지막날?... 감도이의 자유` |
| `videoType` | `REPLAY` |
| `videoCategory` | `Grand_Theft_Auto_V` |
| `videoCategoryValue` | `Grand Theft Auto V` |
| `publishDateAt` | `1790437188542` (`2026-09-26T15:39:48.542Z`) |
| `thumbnailImageUrl` | `https://video-phinf.pstatic.net/20260927_181/1790437231211SFPKX_JPEG/rdAWzqkDpO_05.jpg` |

따라서 해당 VOD 페이지에 표시된 `Grand Theft Auto V` 태그는 API의 실제 `videoCategoryValue`와 정확히 일치한다. 이 단건 응답에서는 `videoType === "REPLAY" && videoCategoryValue === "Grand Theft Auto V"` 조건이 모두 참이므로 두 조건을 함께 필터링할 수 있다. `--video-no <videoNo>`는 이 단건 검증을 재현하고, `--find-gta`는 채널별 최대 3페이지의 목록 응답에서 같은 AND 조건을 검사한다.

## `liveOpenDate` 상세 응답 검증

`--video-no`는 상세 응답의 원본 값과 JSON 타입도 출력한다. 2026-09-27에 다주 VOD 3건의 상세 응답만 추가 조회했다. 목록을 추가 페이지 탐색하지 않았다.

### 지정 GTA V VOD: `15390665`

| 필드 | 원본 값 | JSON 타입 |
| - | - | - |
| `videoNo` | `15390665` | `number` |
| `videoType` | `REPLAY` | `string` |
| `videoCategoryValue` | `Grand Theft Auto V` | `string` |
| `publishDateAt` | `1790437188542` | `number` |
| `liveOpenDate` | `2026-09-26 17:38:03` | `string` |
| `duration` | `24917` | `number` |

`publishDateAt`은 UTC `2026-09-26T15:39:48.542Z`, KST `2026-09-27 00:39:48.542+09:00`이다. `liveOpenDate`는 Unix timestamp가 아니라 시간대 정보가 없는 문자열이므로 그 자체로 UTC/KST 변환을 확정할 수 없다.

다만 이 값을 **KST 로컬 시각으로 해석하면** UTC `2026-09-26T08:38:03Z`가 된다. `duration`을 초 단위 재생 시간으로 가정한 계산 종료 시각은 KST `2026-09-27 00:33:20`이고, 등록 시각은 그 388.542초(약 6분 29초) 뒤다. 이는 실제 방송 시작 및 재생 길이와 일관된 관측이지만, 필드 의미나 duration의 방송 전체 길이를 증명하지는 않는다.

headless 브라우저로 확인한 원본 페이지는 제목·카테고리와 상대 시각 `20시간 전`을 표시했지만, 정확한 방송 시작 일시는 표시하지 않았다. 따라서 화면만으로 `liveOpenDate`의 의미를 확인할 수 없었다.

### 추가 상세 응답 교차 관측

| VOD | `liveOpenDate` 원본 (`string`) | `duration` (`number`) | `publishDateAt` KST | KST로 해석한 `start + duration` | 등록 시각과의 차이 | 원본 페이지 날짜 표시 |
| - | - | -: | - | - | -: | - |
| `15379521` / `즐추 산악회` | `2026-09-25 18:02:16` | 44064 | 2026-09-26 06:27:27.977 | 2026-09-26 06:16:40 | 647.977초 | `09.26` |
| `14870335` / `소녀들의 좀보이드 마지막날 루이빌 정복하기` | `2026-08-25 12:01:42` | 27453 | 2026-08-25 19:45:48.941 | 2026-08-25 19:39:15 | 393.941초 | 화면 날짜 미확인 |

세 건 모두 KST로 해석한 시작 시각과 `duration`의 합 뒤 약 6~11분에 VOD 등록 시각이 있다. UTC로 해석하면 등록 시각이 계산 종료보다 앞서므로 이 관측과 맞지 않는다. 이는 `liveOpenDate`가 KST 표기의 방송 시작 시각일 가능성을 뒷받침하는 **상관관계**다. 그러나 공개 스키마 설명, 방송 종료 원본 필드, 실제 전체 방송 길이와의 독립적인 대조는 확인하지 못했으므로 확정 사실로 취급하지 않는다.

상세 응답 3건에서는 명시적인 방송 종료 시각 필드를 찾지 못했다. `duration`은 VOD 재생 시간으로 제공되지만 전체 방송 구간을 계산해도 되는지는 검증되지 않았다.

## 2-2. 방송 구간 판별 검증 (2026-09-30)

### 재현한 사실

기존의 상세 응답 3건(`15390665`, `15379521`, `14870335`)을 같은 단건 요청으로 다시 조회했다. 세 응답 모두 `duration`은 `number`였으며, 초로 환산하면 각각 `06:55:17`, `12:14:24`, `07:37:33`이다. `liveOpenDate`를 KST 로컬 시작 시각으로 읽고 `duration`을 초로 더했을 때, `publishDateAt`은 각각 계산 종료 뒤 `388.542`, `647.977`, `393.941`초에 위치했다. 따라서 `duration`의 **단위는 초**이며 VOD 길이를 나타내는 값이라는 해석은 이 표본과 일관된다.

공개 VOD 페이지의 정적 HTML도 1건(`15390665`)을 확인했으나, 초기 문서는 비어 있는 플레이어 컨테이너와 클라이언트 스크립트만 제공했다. 자동화 가능한 페이지 표기에서 재생 종료 시간 또는 독립적인 전체 재생 길이를 읽지 못했으므로, API `duration`과 플레이어 표시를 독립적으로 대조하지는 못했다. 페이지에 실제로 표시되는 정확한 방송 시작·종료 시각도 확인하지 못했다.

### 결론: 운영 시간 강제 필터에는 사용하지 않음

`liveOpenDate`가 시간대가 없는 문자열이고 공개 스키마 설명이 없으며, `duration`은 편집·삭제 구간을 포함하지 않는 VOD 재생 길이일 수 있다. 세 건의 등록 지연 상관관계만으로 이 둘을 **실제 방송 전체 구간**으로 확정할 수는 없다. 따라서 다음 계산은 후보 분석에는 유용하지만 Collector의 포함/제외를 결정하는 강제 필터로 사용하지 않는다.

```ts
const inferredVodEnd = inferredVodStart + duration * 1_000;
const overlaps = inferredVodStart < operatingEnd && inferredVodEnd > operatingStart;
```

만약 두 값이 장래에 독립적으로 검증된다면, 시작 시각이 운영 시간 안에 드는지 비교하는 대신 위의 반열린 구간 교집합을 사용해야 한다. 예를 들어 KST `17:38 ~ 00:33` 방송은 `18:00 ~ 03:00` 운영 구간과 겹치므로 시작 시각만 검사하면 잘못 제외된다.

구간 알고리즘 자체의 경계 귀속은 기존 `getBongnudoScheduleStatus()`로 표현 가능하다. KST `09/26 22:00 ~ 09/27 01:30`은 09/26 운영일에 귀속되고, 목요일 `23:00 ~` 금요일 `02:00`은 목요일 운영 구간과 겹친다. 반면 금요일 `23:00 ~` 토요일 `02:00`은 금요일 운영일의 `DAY_OFF` 구간이다. 이는 **검증된 구간이 주어졌을 때의 일정 규칙**일 뿐, 현 VOD 메타데이터에서 그 구간을 확정할 수 있다는 뜻은 아니다.

따라서 다음 Collector에서는 참가자 채널·`REPLAY`·정확한 GTA V 카테고리·등록 수집 기간을 만족한 VOD를 후보로 보존한다. `liveOpenDate`/`duration`으로 운영 시간 또는 금요일 휴무를 적용해 후보를 제거하지 않는다. 이 날짜 PoC는 여기서 종료한다.

## 2026-09-27 단발성 관측 결과

| 채널 | 페이지 | 전체 페이지 | 첫 항목 |
| - | -: | -: | - |
| 남봉 (`ac6a...836e`) | 1 | 24 | `videoNo` 14119156, `REPLAY`, 2026-07-09T20:26:34.573Z |
| 다주 (`bdc5...c6e5`) | 1 | 29 | `videoNo` 14870335, `REPLAY`, 2026-08-25T10:45:48.941Z |
| 멋사 (`29f2...45ce`) | 0 | 0 | 빈 목록 |

첫 두 채널은 `videoNo`, `channel.channelId`, `videoTitle`, `thumbnailImageUrl`, `publishDateAt`, `duration`, `videoType`를 제공했다. PoC의 `url`은 확인한 공개 페이지 규칙 `https://chzzk.naver.com/video/{videoNo}`로 구성한다. `liveStartedAt`은 관측한 목록 항목에 없으므로 `null`이며 추정하지 않는다.

`videoType`은 `REPLAY`로 다시보기를 구분할 수 있다. 응답에는 `categoryType`, `videoCategory`, `videoCategoryValue`가 있었고, 관측 항목은 각각 `Valorant`/`발로란트`, `Project_Zomboid`/`프로젝트 좀보이드`였다. 따라서 GTA V 여부는 가능한 필드이지만, 이 세 채널의 첫 항목만으로 GTA V 값의 존재를 단정할 수는 없다.

## 페이지네이션과 증분 수집 관련 관측

남봉 채널에서 1페이지 마지막 항목은 `videoNo` 13339772, `publishDateAt` 2026-05-22T15:39:09.191Z이고, 2페이지 첫 항목은 `videoNo` 13316804, `publishDateAt` 2026-05-21T08:17:38.727Z였다. 이 관측에서는 페이지 경계가 최신순이다.

그러나 이는 한 채널의 두 페이지 관측일 뿐이다. `videoNo`의 전역 단조 증가, 목록의 항상 최신순, 늦게 등록된 REPLAY가 없다는 보장은 확인되지 않았다. 따라서 이 관측만으로 페이지 종료 조건이나 재조회 범위를 확정할 수 없다.

## 썸네일

남봉의 첫 썸네일 URL은 `video-phinf.pstatic.net`에서 `200`, `Content-Type: image/jpeg`, `Cache-Control: max-age=604800`을 반환했다. 한 번의 Referer 없는 HEAD 요청도 `200`이었으나, URL 만료·호스트 변경 여부와 장기적인 hotlink 허용은 검증되지 않았다.

현재 ChCTV는 카드 이미지를 `unoptimized`로 표시하므로 해당 URL을 그대로 쓰는 경우 Next.js image remote pattern은 필요하지 않다. 향후 Next.js 최적화 이미지를 쓰면 `video-phinf.pstatic.net` remote pattern을 별도로 추가하고 다시 검증해야 한다.

## 후속 개발 고려사항

> 본 PoC는 공개 VOD 메타데이터의 응답 구조를 확인하기 위한 독립적인 기술 검증이다. 실제 영상 파일을 저장하거나 재생하지 않으며, 기존 서비스의 자동 수집 및 사용자 화면과 연결하지 않았다.
>
> 실제 운영 시에는 NAVER 및 CHZZK의 관련 정책과 데이터 이용 허용 범위를 확인한다.

기존 `vod-client.ts`의 응답 mapper, `participant-vods.ts`의 `videoNo` 중복 제거, Redis snapshot의 실패 시 기존 데이터 유지 구조는 재사용 후보이다. 실제 Collector의 대상 필터, 날짜 판별, 후보 분류, 페이지 종료 기준은 [수집 정책 문서](./bongnudo2-vod-collection-policy.md)를 따른다.
