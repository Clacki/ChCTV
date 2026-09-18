import { expect, test } from "@playwright/test";

test("홈 헤더의 다시보기 메뉴가 내부 /vods 페이지로 이동한다", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "봉누도 다시보기" }).click();

  await expect(page).toHaveURL(/\/vods$/);
  await expect(page.getByRole("heading", { name: "봉누도 다시보기" })).toBeVisible();
});
