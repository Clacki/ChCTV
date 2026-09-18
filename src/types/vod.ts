/**
 * ChCTV가 CHZZK 채널 VOD 목록에서 사용하는 공용 영상 데이터다.
 * 참가자 메타데이터는 `channelId`로 `participants` 카탈로그와 연결한다.
 */
export type Vod = {
  videoNo: number;
  channelId: string;
  title: string;
  thumbnailUrl: string | null;
  viewCount: number;
  duration: number;
  publishedAt: number;
  videoType: string;
  channelName: string;
  channelImageUrl: string | null;
};
