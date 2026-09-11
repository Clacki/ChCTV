import { expect, test } from "@playwright/test";

test("shows the ChCTV landing page", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "ChCTV" })).toBeVisible();
});
