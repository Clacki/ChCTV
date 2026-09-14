import { expect, test } from "@playwright/test";

test("shows the ChCTV discovery workspace", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "봉누도 상황실" })).toBeVisible();
});

test("starts multiview with ordered channel query parameters", async ({ page }) => {
  await page.goto("/");

  const addButtons = page.locator('button[aria-label$="선택에 추가"]');
  await expect(addButtons).toHaveCount(8);
  await addButtons.nth(0).press("Enter");
  await addButtons.nth(1).press("Enter");

  await expect(page.getByText("Main", { exact: true })).toBeVisible();
  await expect(page.getByText("Sub 1", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "멀티뷰 시작" }).click();
  await expect(page).toHaveURL("/multiview?channel=mock-channel-game&channel=mock-channel-radio");
  await expect(page.getByText("mock-channel-game", { exact: true })).toBeVisible();
  await expect(page.getByText("mock-channel-radio", { exact: true })).toBeVisible();
});

test("handles direct multiview access without channel parameters", async ({ page }) => {
  await page.goto("/multiview");

  await expect(page.getByText("선택된 방송이 없습니다.", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Discovery로 돌아가기" })).toHaveAttribute("href", "/");
});
