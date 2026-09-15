export const GROUP_FILTER_SECTIONS = [
  {
    label: "소속 / MCN",
    values: ["인챈트", "픽셀", "샌드박스", "카론"],
  },
  {
    label: "버튜버 / 프로젝트",
    values: ["스텔라이브", "플라네타", "리스텔라", "오버더월", "리액트KR", "미츄", "프로젝트아이"],
  },
] as const;

export const GROUP_FILTER_VALUES = GROUP_FILTER_SECTIONS.flatMap((section) => section.values);

// TODO: 참가자 JSON tags 기반 필터가 준비되면 이 구성 파일에 추가한다.
