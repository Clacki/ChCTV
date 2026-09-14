export type MockSavedMultiview = {
  id: string;
  name: string;
  streamIds: readonly string[];
};

export const mockSavedMultiviews: readonly MockSavedMultiview[] = [
  {
    id: "night-patrol",
    name: "경찰 시점",
    streamIds: ["mock-patrol", "mock-office", "mock-hospital", "mock-garage"],
  },
  {
    id: "favorite-four",
    name: "스텔 경찰",
    streamIds: ["mock-patrol", "mock-office", "mock-radio", "mock-taxi"],
  },
  {
    id: "police-and-press",
    name: "메인+서브",
    streamIds: ["mock-hospital", "mock-garage", "mock-radio"],
  },
];
