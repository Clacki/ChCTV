import { expect, test } from "@playwright/test";

const item = {
  videoNo: 123,
  channelId: "a".repeat(32),
  title: "봉누도 다시보기 제목",
  thumbnailUrl: null,
  publishedAt: "2026-09-27T10:00:00.000Z",
  duration: 3723,
  url: "https://chzzk.naver.com/video/123",
  participant: { name: "테스트 참가자", channelId: "a".repeat(32), affiliations: ["경찰청"] },
};

test("/vods renders compact VOD cards from the read API", async ({ page }) => {
  await page.route("**/api/vods", (route) => route.fulfill({ json: { items: [item], total: 1 } }));
  await page.goto("/vods");

  await expect(page.getByRole("heading", { name: "봉누도 다시보기" })).toBeVisible();
  await expect(page.getByRole("list", { name: "봉누도 다시보기 목록" })).toBeVisible();
  const link = page.getByRole("link", { name: "봉누도 다시보기 제목 다시보기 열기" });
  await expect(link).toHaveAttribute("href", item.url);
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(page.getByText("테스트 참가자", { exact: true })).toBeVisible();
  await expect(page.getByText("1:02:03", { exact: true })).toBeVisible();
  await expect(page.getByText("경찰청", { exact: true })).toBeVisible();
  await expect(link.getByText(/^등록 /)).toBeVisible();
});

test("/vods supports a VOD without participant or thumbnail", async ({ page }) => {
  await page.route("**/api/vods", (route) => route.fulfill({ json: { items: [{ ...item, participant: null }], total: 1 } }));
  await page.goto("/vods");

  await expect(page.getByText("썸네일 없음", { exact: true })).toBeVisible();
  await expect(page.getByText(item.channelId, { exact: true })).toHaveCount(0);
});

test("/vods shows card skeletons while the API is loading", async ({ page }) => {
  await page.route("**/api/vods", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    await route.fulfill({ json: { items: [item], total: 1 } });
  });
  await page.goto("/vods");

  await expect(page.getByLabel("다시보기 불러오는 중")).toBeVisible();
  await expect(page.getByRole("list", { name: "봉누도 다시보기 목록" })).toBeVisible();
});

test("/vods keeps a long title in the mobile card grid", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  const longTitle = "긴 제목이 두 줄을 넘어가더라도 다시보기 카드 레이아웃을 깨뜨리지 않아야 합니다";
  await page.route("**/api/vods", (route) => route.fulfill({ json: { items: [{ ...item, title: longTitle }], total: 1 } }));
  await page.goto("/vods");

  await expect(page.getByRole("link", { name: `${longTitle} 다시보기 열기` })).toBeVisible();
});

test("/vods distinguishes an empty snapshot from a failed API request", async ({ page }) => {
  await page.route("**/api/vods", (route) => route.fulfill({ json: { items: [], total: 0 } }));
  await page.goto("/vods");
  await expect(page.getByText("아직 등록된 다시보기가 없습니다.", { exact: true })).toBeVisible();

  await page.unroute("**/api/vods");
  await page.route("**/api/vods", (route) => route.fulfill({ status: 500, json: { ok: false } }));
  await page.reload();
  await expect(page.locator("section[role=alert]")).toContainText("다시보기를 불러오지 못했습니다.");
});
