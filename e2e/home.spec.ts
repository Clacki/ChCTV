import { expect, test } from "@playwright/test";

test("shows the ChCTV discovery workspace", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "봉누도 상황실" })).toBeVisible();
});
